import { loadDirectChat } from './directChat';
import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';
import { readChatMediaSource } from './chatMediaTranscription';
import {
  cleanQuestions,
  fallbackQuestions,
  isGenericQuestion,
  starterFollowUps,
} from './followUpQuestionFallback';
import { supabase } from './supabase';

export async function generateFollowUpQuestion(contacts: FamilyProfile[]) {
  const answers = await Promise.all(contacts.map(loadLatestAnswer));
  const latestAnswer = answers
    .filter((answer) => answer !== null)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))[0];
  const answerText = latestAnswer ? await messageStoryText(latestAnswer) : '';
  const questions = await questionsFromText(answerText, answerText);

  return questions[0] ?? starterFollowUps[0];
}

export async function generateFollowUpQuestionsFromChat(messages: DirectChatMessage[]) {
  const answer = findLatestStoryMessage(messages);
  const answerText = answer ? await messageStoryText(answer) : '';
  const context = await formatContext(messages, answer);
  return questionsFromText(answerText, context);
}

export async function refreshFollowUpQuestionsFromChat(messages: DirectChatMessage[]) {
  const answer = findLatestStoryMessage(messages);
  const answerText = answer ? await messageStoryText(answer) : '';
  const context = await formatContext(messages, answer);
  return questionsFromText(answerText, context, Date.now());
}

export async function generateFollowUpQuestionFromChat(messages: DirectChatMessage[]) {
  const questions = await generateFollowUpQuestionsFromChat(messages);
  return questions[0] ?? starterFollowUps[0];
}

async function questionsFromText(answerText: string, context: string, refreshSeed?: number) {
  if (!answerText.trim()) return starterFollowUps;

  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      prompt: [
        `Grandmother's latest message: ${answerText}`,
        'Recent chat context:',
        context,
        refreshSeed ? `Refresh request: give a different angle than before. Seed ${refreshSeed}.` : '',
      ].join('\n'),
      system:
        'Read the grandmother message carefully, then write 4-5 specific follow-up questions a child can ask. Each question must be based on one concrete detail from the latest message or recent context. Avoid generic questions like "What happened after that?" unless there is no detail. Do not invent names, places, events, animals, or relatives. Keep each question short enough for a phone button, about 5-9 words. Preserve the chat language when possible. Return valid JSON only: {"questions":["question"]}.',
    },
  });

  if (error) {
    return fallbackQuestions(answerText, refreshSeed);
  }

  const questions = typeof data?.text === 'string' ? cleanQuestions(data.text) : [];
  const usefulQuestions = questions.filter((question) => !isGenericQuestion(question));
  return usefulQuestions.length >= 3 ? usefulQuestions : fallbackQuestions(answerText, refreshSeed);
}

async function loadLatestAnswer(contact: FamilyProfile) {
  const messages = await loadDirectChat(contact.id);
  return findLatestStoryMessage(messages);
}

function findLatestStoryMessage(messages: DirectChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message.isMine && isStoryMessage(message)) return message;
  }

  return null;
}

async function formatContext(messages: DirectChatMessage[], answer: DirectChatMessage | null) {
  const answerIndex = answer
    ? messages.findIndex((message) => message.id === answer.id)
    : messages.length - 1;
  const endIndex = answerIndex === -1 ? messages.length : answerIndex + 1;

  const contextLines = await Promise.all(messages
    .slice(Math.max(0, endIndex - 5), endIndex)
    .map(async (message) => {
      const speaker = message.isMine ? 'Child' : 'Grandmother';
      const body = await messageStoryText(message);
      return `${speaker}: ${body || `[${message.mediaType ?? 'media'} message, no transcript]`}`;
    }));
  return contextLines.join('\n');
}

function isStoryMessage(message: DirectChatMessage) {
  const cleanText = cleanStoryText(message.body);
  return (cleanText.length > 20 && !cleanText.includes('?')) || Boolean(message.mediaUrl);
}

async function messageStoryText(message: DirectChatMessage) {
  const body = cleanStoryText(message.body);
  if (body) return body;
  if (!message.mediaType || !message.mediaUrl) return '';

  const sentAt = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(message.createdAt));
  const media = await readChatMediaSource({
    url: message.mediaUrl,
    mediaType: message.mediaType,
    speaker: 'Grandmother',
    sentAt,
  });

  return media.transcript ?? '';
}

function cleanStoryText(text: string) {
  return text.trim().replace(/^Story transcript:\s*/i, '').replace(/\s+/g, ' ');
}
