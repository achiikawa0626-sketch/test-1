import { loadDirectChat } from './directChat';
import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';
import { supabase } from './supabase';

const starterFollowUps = [
  'What happened after that?',
  'How did you feel in that moment?',
  'What do you remember most clearly about that day?',
];

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

export async function refreshFollowUpQuestionsFromChat(messages: DirectChatMessage[]) {
  const answer = findLatestStoryText(messages);
  return questionsFromAnswer(answer, formatContext(messages, answer), Date.now());
}

export async function generateFollowUpQuestionFromChat(messages: DirectChatMessage[]) {
  const questions = await generateFollowUpQuestionsFromChat(messages);
  return questions[0] ?? starterFollowUps[0];
}

async function questionsFromAnswer(
  answer: DirectChatMessage | null,
  context = answer?.body ?? '',
  refreshSeed?: number,
) {
  if (!answer) return starterFollowUps;

  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      prompt: [
        `Grandmother's latest message: ${cleanStoryText(answer.body)}`,
        'Recent chat context:',
        context,
        refreshSeed ? `Refresh request: give a different angle than before. Seed ${refreshSeed}.` : '',
      ].join('\n'),
      system:
        'Read the grandmother message carefully, then write 2-3 specific follow-up questions a child can ask. Each question must be based on one concrete detail from the latest message or recent context. Avoid generic questions like "What happened after that?" unless there is no detail. Do not invent names, places, events, animals, or relatives. Keep each question short enough for a phone button, about 5-9 words. Preserve the chat language when possible. Return valid JSON only: {"questions":["question"]}.',
    },
  });

  if (error) {
    return fallbackQuestions(answer.body, refreshSeed);
  }

  const questions = typeof data?.text === 'string' ? cleanQuestions(data.text) : [];
  return questions.length > 0 ? questions : fallbackQuestions(answer.body, refreshSeed);
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

function fallbackQuestions(text: string, refreshSeed = 0) {
  const questions = safeFallbackQuestions(text);
  const offset = questions.length > 0 ? refreshSeed % questions.length : 0;
  const rotatedQuestions = [...questions.slice(offset), ...questions.slice(0, offset)];

  return rotatedQuestions
    .filter((question, index, questions) => questions.indexOf(question) === index)
    .slice(0, 3);
}

function safeFallbackQuestions(text: string) {
  const lowerText = text.toLowerCase();

  if (hasAny(lowerText, ['игруш', 'toy'])) {
    return [
      lowerText.includes('потер') || lowerText.includes('lost')
        ? 'Где ты потеряла игрушки?'
        : 'Какие игрушки ты любила?',
      'С кем ты играла?',
      'Почему они были любимыми?',
      'Что ты помнишь об игре?',
    ];
  }
  if (hasAny(lowerText, ['играл', 'играла', 'play'])) {
    return ['Во что ты играла?', 'С кем ты играла?', 'Где вы обычно играли?'];
  }
  if (hasAny(lowerText, ['плак', 'рыда', 'cry'])) {
    return ['Кто тебя тогда утешил?', 'Что помогло тебе успокоиться?', 'Как ты это пережила?'];
  }
  if (hasAny(lowerText, ['7 лет', 'seven', '7 year'])) {
    return ['Какой ты была в семь?', 'Что ты любила тогда?', 'Кто был рядом с тобой?'];
  }
  if (lowerText.includes('birthday')) {
    return ['What else happened on that birthday?', 'How did you feel that day?', 'Who was with you?'];
  }
  if (lowerText.includes('father')) {
    return ['What do you remember about your father that day?', 'How did he make you feel?', 'What happened next?'];
  }
  if (lowerText.includes('mother')) {
    return ['What do you remember about your mother that day?', 'How did she make you feel?', 'What happened next?'];
  }
  if (lowerText.includes('school')) {
    return ['What was school like for you then?', 'Who was your favorite teacher?', 'What did you do after school?'];
  }

  return starterFollowUps;
}

function hasAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle));
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
