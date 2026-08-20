import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';
import type { HomeLanguage } from './homeTranslations';
import { readChatMediaSource } from './chatMediaTranscription';
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

type StorySource = {
  lines: string[];
};

export async function generateChatBook(input: ChatBookInput): Promise<ChatBook> {
  const bookMessages = selectBookMessages(input.messages);
  if (bookMessages.length === 0) {
    throw new Error('There are no text, audio, or video memories to turn into a book yet.');
  }

  const base = {
    title: `${input.contact.displayName}'s Story`,
    authorLine: 'A family storybook made from shared memories',
  };
  const source = await buildSource(input, bookMessages);

  return buildBookFromText({
    ...base,
    language: 'en',
    sourceName: input.contact.displayName,
    sourceText: source.lines.join('\n\n'),
  });
}

async function buildSource(input: ChatBookInput, messages: DirectChatMessage[]): Promise<StorySource> {
  const lines = await Promise.all(
    messages.map(async (message) => {
      const speaker = message.isMine ? input.myName : input.contact.displayName;
      const body = cleanTranscript(message.body);

      if (!message.mediaType || !message.mediaUrl) return `${speaker}: ${body}`;

      const sentAt = new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(message.createdAt));
      const media = await readChatMediaSource({
        url: message.mediaUrl,
        mediaType: message.mediaType,
        speaker,
        sentAt,
      });
      const transcript = body || media.transcript;

      return transcript
        ? `${speaker} ${message.mediaType} transcript: ${transcript}`
        : `${speaker} shared a ${message.mediaType}, but no transcript was available.`;
    }),
  );

  return { lines };
}

function selectBookMessages(messages: DirectChatMessage[]) {
  const usableMessages = messages.filter(
    (message) => isUsableBookText(message.body) || Boolean(message.mediaUrl),
  );
  const answerMessages = usableMessages.filter((message) => !message.isMine);
  return answerMessages.length > 0 ? answerMessages : usableMessages;
}

function isUsableBookText(text: string) {
  return cleanTranscript(text).length > 0;
}

function cleanTranscript(text: string) {
  return text
    .trim()
    .replace(/^Story transcript:\s*/i, '')
    .replace(/\s+/g, ' ');
}
