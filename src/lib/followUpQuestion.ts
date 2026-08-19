import { loadDirectChat } from './directChat';
import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';
import { disableOptionalFeature, isOptionalFeatureEnabled } from './optionalFeatureFlags';
import { supabase } from './supabase';
import { isMissingSupabaseResource } from './supabaseErrors';

const AI_FUNCTION = 'ai-function';

export async function generateFollowUpQuestion(contacts: FamilyProfile[]) {
  const answer = await findLatestGrandparentAnswer(contacts);
  return generateQuestionFromAnswer(answer);
}

export async function generateFollowUpQuestionFromChat(
  contact: FamilyProfile,
  messages: DirectChatMessage[],
) {
  const answerIndex = findLatestAnswerIndex(messages);
  if (answerIndex === -1) return '';

  const answer = messages[answerIndex];
  return generateQuestionFromAnswer({
    body: answer.body.trim(),
    contactName: contact.displayName,
    context: formatContext(messages.slice(Math.max(0, answerIndex - 5), answerIndex + 1)),
    createdAt: answer.createdAt,
  });
}

async function generateQuestionFromAnswer(
  answer: {
    body: string;
    contactName: string;
    context: string;
    createdAt: string;
  } | null,
) {
  if (!answer) return '';
  if (!isOptionalFeatureEnabled(AI_FUNCTION)) return '';

  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      prompt: [
        `Grandparent: ${answer.contactName}`,
        `Their latest answer: ${answer.body}`,
        `Recent chat:`,
        answer.context,
      ].join('\n'),
      system:
        'Write one short, warm follow-up question a child can ask their grandparent. Use only details that appear in the latest answer or recent chat. Do not invent names, places, events, or family members. Mention one real detail when there is enough detail. If the answer is too short, ask a simple question that helps them tell more. Keep it natural for a family chat. Return only the question.',
    },
  });

  if (error) {
    if (isMissingSupabaseResource(error.message) || error.message.includes('Failed to fetch')) {
      disableOptionalFeature(AI_FUNCTION);
    }

    return '';
  }
  return typeof data?.text === 'string' ? cleanQuestion(data.text) : '';
}

async function findLatestGrandparentAnswer(contacts: FamilyProfile[]) {
  const answers = await Promise.all(
    contacts.map(async (contact) => {
      const messages = await loadDirectChat(contact.id);
      const answerIndex = findLatestAnswerIndex(messages);
      if (answerIndex === -1) return null;

      const answer = messages[answerIndex];
      return {
        body: answer.body.trim(),
        contactName: contact.displayName,
        context: formatContext(messages.slice(Math.max(0, answerIndex - 5), answerIndex + 1)),
        createdAt: answer.createdAt,
      };
    }),
  );

  return answers
    .filter((answer) => answer !== null)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))[0] ?? null;
}

function findLatestAnswerIndex(messages: DirectChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message.isMine && message.body.trim()) return index;
  }

  return -1;
}

function formatContext(messages: DirectChatMessage[]) {
  return messages
    .map((message) => {
      const speaker = message.isMine ? 'Child' : 'Grandparent';
      return `${speaker}: ${message.body.trim() || `[${message.mediaType ?? 'media'} message, no transcript]`}`;
    })
    .join('\n');
}

function cleanQuestion(text: string) {
  return text
    .replace(/^["']|["']$/g, '')
    .trim()
    .slice(0, 180);
}
