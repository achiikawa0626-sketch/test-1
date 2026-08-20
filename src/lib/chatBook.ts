import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';
import type { HomeLanguage } from './homeTranslations';
import { parseAiBookDraft } from './chatBookAiDraft';
import { readChatMediaSource } from './chatMediaTranscription';
import { buildBookFromText } from './storyBookBuilder';
import { supabase } from './supabase';

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
  mediaReferences: string[];
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
  const aiBook = await buildAiBook(base, source).catch(() => undefined);
  if (aiBook) return aiBook;

  return buildBookFromText({
    ...base,
    language: 'en',
    sourceName: input.contact.displayName,
    sourceText: source.lines.join('\n\n'),
  });
}

async function buildSource(input: ChatBookInput, messages: DirectChatMessage[]): Promise<StorySource> {
  const mediaReferences: string[] = [];
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
      mediaReferences.push(media.reference);

      return transcript
        ? `${speaker} shared this ${message.mediaType} memory: ${transcript}`
        : `${speaker} shared a ${message.mediaType}, but no transcript was available.`;
    }),
  );

  return { lines, mediaReferences };
}

async function buildAiBook(
  base: { title: string; authorLine: string },
  source: StorySource,
): Promise<ChatBook | undefined> {
  const sourceText = source.lines.join('\n');
  if (!sourceText.trim()) return undefined;

  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      system: [
        'You are a family storybook writer.',
        'Turn chat text and audio/video transcripts into warm story scenes.',
        'Use the supplied transcript as story material, like an Otter.ai or Google Recorder transcript that has been cleaned into prose.',
        'Do not write raw labels like "Story transcript", "audio transcript", "the chat says", or URLs.',
        'Do not invent new facts, names, places, animals, or events.',
        'Return strict JSON only with this shape: {"overview":"...","chapters":[{"title":"...","prose":["paragraph"],"sourceNotes":["short source note"]}]}',
      ].join(' '),
      prompt: [
        `Book title: ${base.title}`,
        'Write 2-4 short chapters.',
        'Make each chapter read like a real family memory, not a transcript.',
        'If the source is in Russian, Kazakh, or mixed language, keep the meaning and write clear natural prose.',
        '',
        'Source material:',
        sourceText,
      ].join('\n'),
    },
  });

  if (error || typeof data?.text !== 'string') return undefined;
  const draft = parseAiBookDraft(data.text);

  return {
    ...base,
    overview: draft.overview,
    chapters: draft.chapters.map((chapter) => ({
      ...chapter,
      mediaReferences: source.mediaReferences,
    })),
    language: 'en',
  };
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
