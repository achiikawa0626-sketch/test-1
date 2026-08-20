import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';
import type { HomeLanguage } from './homeTranslations';
import { buildBookFromText } from './storyBookBuilder';

type ChatBookInput = {
  contact: FamilyProfile;
  messages: DirectChatMessage[];
  myName: string;
};

export type ChatBookChapter = {
  title: string;
  prose: string[];
  sourceNotes: string[];
  mediaReferences: string[];
};

export type ChatBook = {
  title: string;
  authorLine: string;
  overview: string;
  chapters: ChatBookChapter[];
  language: HomeLanguage;
};

export async function generateChatBook(input: ChatBookInput): Promise<ChatBook> {
  const bookMessages = selectBookMessages(input.messages);
  if (bookMessages.length === 0) {
    throw new Error('There are no text messages to turn into a book yet.');
  }

  const base = {
    title: `${input.contact.displayName}'s Story`,
    authorLine: `A family storybook made from written memories`,
  };
  const source = buildSource(bookMessages);

  return buildBookFromText({
    ...base,
    language: 'en',
    sourceName: 'Grandma',
    sourceText: source.lines.join('\n\n'),
  });
}

type StorySource = {
  lines: string[];
};

function buildSource(messages: DirectChatMessage[]): StorySource {
  return {
    lines: messages.map((message) => cleanBookText(message.body)),
  };
}

function selectBookMessages(messages: DirectChatMessage[]) {
  const textMessages = messages.filter((message) => isUsableBookText(message.body));
  const answerMessages = textMessages.filter((message) => !isMostlyQuestion(message.body));
  return answerMessages.length > 0 ? answerMessages : textMessages;
}

function isUsableBookText(text: string) {
  const cleanText = cleanBookText(text);
  return cleanText.length > 0 && !cleanText.toLowerCase().startsWith('story transcript:');
}

function isMostlyQuestion(text: string) {
  const cleanText = cleanBookText(text);
  if (!cleanText.includes('?')) return false;

  const questionMarks = cleanText.split('?').length - 1;
  const sentenceMarks = cleanText.split(/[.!?]/).length - 1;
  return questionMarks >= Math.max(1, sentenceMarks);
}

function cleanBookText(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}
