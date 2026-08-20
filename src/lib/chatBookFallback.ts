import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';

type FallbackInput = {
  contact: FamilyProfile;
  messages: DirectChatMessage[];
  myName: string;
  sourceLines?: string[];
};

export type FallbackBookDraft = {
  overview: string;
  chapters: Array<{
    title: string;
    prose: string[];
    sourceNotes: string[];
  }>;
};

export function createFallbackBookDraft(input: FallbackInput): FallbackBookDraft {
  if (input.sourceLines?.length) return createDraftFromSourceLines(input.sourceLines);

  const storyMessages = input.messages.filter((message) => message.body.trim() || message.mediaUrl);
  const chapters = chunkMessages(storyMessages, 4).map((messages, index) => ({
    title: chapterTitle(index, messages),
    prose: [writeChapter(input, messages)],
    sourceNotes: messages.map((message) => sourceNote(input, message)),
  }));

  return {
    overview: `${input.contact.displayName} and ${input.myName} saved a small family story together. This book keeps their questions, answers, and shared memories in one warm place.`,
    chapters,
  };
}

function createDraftFromSourceLines(sourceLines: string[]): FallbackBookDraft {
  return {
    overview: 'A family storybook made from the words shared in this chat.',
    chapters: chunkMessages(sourceLines, 4).map((lines, index) => ({
      title: `Memory ${index + 1}`,
      prose: [lines.map(cleanSourceLine).join(' ')],
      sourceNotes: lines.map((line) => line.split(':')[0] ?? 'Chat message'),
    })),
  };
}

function writeChapter(input: FallbackInput, messages: DirectChatMessage[]) {
  return messages
    .map((message) => {
      const speaker = message.isMine ? input.myName : input.contact.displayName;
      const body = cleanTranscript(message.body);
      if (body) return `${speaker} remembered: ${body}`;
      if (message.mediaType === 'video') return `${speaker} shared a video memory.`;
      if (message.mediaType === 'audio') return `${speaker} shared an audio memory.`;
      return `${speaker} added a family memory.`;
    })
    .join(' ');
}

function sourceNote(input: FallbackInput, message: DirectChatMessage) {
  const speaker = message.isMine ? input.myName : input.contact.displayName;
  const sentAt = new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
    new Date(message.createdAt),
  );
  return `${speaker}, ${sentAt}`;
}

function chapterTitle(index: number, messages: DirectChatMessage[]) {
  const firstText = cleanTranscript(messages.find((message) => message.body.trim())?.body ?? '');
  if (!firstText) return `Memory ${index + 1}`;
  return firstText.split(/\s+/).slice(0, 6).join(' ');
}

function cleanTranscript(value: string) {
  return value.replace(/^Story transcript:\s*/i, '').trim();
}

function cleanSourceLine(value: string) {
  return value.replace(/^\[[^\]]+\]\s*/, '').trim();
}

function chunkMessages<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
