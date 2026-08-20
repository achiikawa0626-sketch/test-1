import { loadDirectChat } from './directChat';
import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';
import { disableOptionalFeature, isOptionalFeatureEnabled } from './optionalFeatureFlags';
import { supabase } from './supabase';
import { isMissingSupabaseResource } from './supabaseErrors';

const AI_FUNCTION = 'ai-function';
const starterFollowUps = [
  'What happened after that?',
  'How did you feel in that moment?',
  'What do you remember most clearly about that day?',
];

const stopWords = new Set([
  'about',
  'after',
  'again',
  'birthday',
  'could',
  'father',
  'favorite',
  'gifted',
  'grandma',
  'happened',
  'mother',
  'really',
  'story',
  'their',
  'there',
  'thing',
  'today',
  'was',
  'were',
  'when',
  'with',
  'would',
  'your',
]);

export async function generateFollowUpQuestion(contacts: FamilyProfile[]) {
  const answers = await Promise.all(contacts.map(loadLatestAnswer));
  const latestAnswer = answers
    .filter((answer) => answer !== null)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))[0];
  const questions = await questionsFromAnswer(latestAnswer);

  return questions[0] ?? starterFollowUps[0];
}

export async function generateFollowUpQuestionsFromChat(messages: DirectChatMessage[]) {
  const answer = findLatestStoryText(messages);
  return questionsFromAnswer(answer, formatContext(messages, answer));
}

export async function generateFollowUpQuestionFromChat(messages: DirectChatMessage[]) {
  const questions = await generateFollowUpQuestionsFromChat(messages);
  return questions[0] ?? starterFollowUps[0];
}

async function questionsFromAnswer(
  answer: DirectChatMessage | null,
  context = answer?.body ?? '',
) {
  if (!answer) return starterFollowUps;
  if (!isOptionalFeatureEnabled(AI_FUNCTION)) return fallbackQuestions(answer.body);

  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      prompt: [
        `Grandmother's latest message: ${cleanStoryText(answer.body)}`,
        'Recent chat context:',
        context,
      ].join('\n'),
      system:
        'Write 2-3 short follow-up questions a child can ask their grandmother. Use only facts from the latest message and recent chat context. Do not invent names, places, events, or relatives. Make each question warm, respectful, curious, and age-appropriate. Return valid JSON only: {"questions":["question"]}.',
    },
  });

  if (error) {
    if (isMissingSupabaseResource(error.message) || error.message.includes('Failed to fetch')) {
      disableOptionalFeature(AI_FUNCTION);
    }
    return fallbackQuestions(answer.body);
  }

  const questions = typeof data?.text === 'string' ? cleanQuestions(data.text) : [];
  return questions.length > 0 ? questions : fallbackQuestions(answer.body);
}

async function loadLatestAnswer(contact: FamilyProfile) {
  const messages = await loadDirectChat(contact.id);
  return findLatestStoryText(messages);
}

function findLatestStoryText(messages: DirectChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message.isMine && isStoryText(message.body)) return message;
  }

  return null;
}

function formatContext(messages: DirectChatMessage[], answer: DirectChatMessage | null) {
  const answerIndex = answer
    ? messages.findIndex((message) => message.id === answer.id)
    : messages.length - 1;
  const endIndex = answerIndex === -1 ? messages.length : answerIndex + 1;

  return messages
    .slice(Math.max(0, endIndex - 5), endIndex)
    .map((message) => {
      const speaker = message.isMine ? 'Child' : 'Grandmother';
      const body = cleanStoryText(message.body);
      return `${speaker}: ${body || `[${message.mediaType ?? 'media'} message, no transcript]`}`;
    })
    .join('\n');
}

function fallbackQuestions(text: string) {
  return [
    questionFromText(text),
    'What happened after that?',
    'How did you feel then?',
  ]
    .filter((question, index, questions) => questions.indexOf(question) === index)
    .slice(0, 3);
}

function questionFromText(text: string) {
  const lowerText = text.toLowerCase();
  const object = findStoryObject(text);

  if (object) {
    if (lowerText.includes('gift')) return `What happened to the ${object} after you got it?`;
    if (lowerText.includes('lost')) return `Did you ever find the ${object} again?`;
    if (lowerText.includes('birthday')) return `Do you still remember what happened to the ${object}?`;
    return `What happened to the ${object} after that?`;
  }

  if (lowerText.includes('birthday')) return 'What else happened on that birthday?';
  if (lowerText.includes('father')) return 'What do you remember about your father that day?';
  if (lowerText.includes('mother')) return 'What do you remember about your mother that day?';
  if (lowerText.includes('school')) return 'What was school like for you then?';

  return starterFollowUps[Math.floor(Math.random() * starterFollowUps.length)];
}

function findStoryObject(text: string) {
  const afterGift = text.match(/\b(?:gifted|gave|bought|made)\s+(?:me\s+)?(?:a|an|the)?\s*([a-z][a-z-]+)/i)?.[1];
  if (afterGift && !stopWords.has(afterGift.toLowerCase())) return afterGift.toLowerCase();

  const words = text
    .toLowerCase()
    .replace(/[^a-z\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  return words[words.length - 1] ?? '';
}

function isStoryText(text: string) {
  const cleanText = cleanStoryText(text);
  return cleanText.length > 20 && !cleanText.includes('?');
}

function cleanStoryText(text: string) {
  return text.trim().replace(/^Story transcript:\s*/i, '').replace(/\s+/g, ' ');
}

function cleanQuestions(text: string) {
  const parsedQuestions = parseQuestionList(text);
  const questions = parsedQuestions.length > 0 ? parsedQuestions : text.split(/\n+/);

  return questions
    .map((question) => cleanQuestion(question.replace(/^[-*\d. )]+/, '')))
    .filter(Boolean)
    .slice(0, 3);
}

function cleanQuestion(text: string) {
  return text.replace(/^["']|["']$/g, '').trim().slice(0, 180);
}

function parseQuestionList(text: string) {
  try {
    const json = JSON.parse(extractJson(text)) as unknown;
    if (!json || typeof json !== 'object') return [];
    const questions = (json as { questions?: unknown }).questions;
    return Array.isArray(questions)
      ? questions.filter((question): question is string => typeof question === 'string')
      : [];
  } catch {
    return [];
  }
}

function extractJson(text: string) {
  return text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text.trim();
}
