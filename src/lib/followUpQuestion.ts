import { loadDirectChat } from './directChat';
import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';

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

  return latestAnswer ? questionFromText(latestAnswer.body) : starterFollowUps[0];
}

export function generateFollowUpQuestionFromChat(messages: DirectChatMessage[]) {
  const answer = findLatestStoryText(messages);
  return answer ? questionFromText(answer.body) : starterFollowUps[0];
}

async function loadLatestAnswer(contact: FamilyProfile) {
  const messages = await loadDirectChat(contact.id);
  return findLatestStoryText(messages);
}

function findLatestStoryText(messages: DirectChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (isStoryText(message.body)) return message;
  }

  return null;
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
  const cleanText = text.trim();
  return cleanText.length > 20 && !cleanText.includes('?') && !cleanText.toLowerCase().startsWith('story transcript:');
}
