import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';
import { parseAiBookDraft } from './chatBookAiDraft';
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
};

export async function generateChatBook(input: ChatBookInput): Promise<ChatBook> {
  const bookMessages = input.messages.filter((message) => message.body.trim() || message.mediaUrl);
  if (bookMessages.length === 0) {
    throw new Error('There are no chat messages or media references to turn into a book yet.');
  }

  const base = {
    title: `${input.contact.displayName} and ${input.myName}`,
    authorLine: `A family storybook for ${input.myName} and ${input.contact.displayName}`,
  };
  const source = buildSource(input, bookMessages);

  try {
    const draft = await writeAiStorybook(base.title, source);
    return {
      ...base,
      overview: draft.overview,
      chapters: draft.chapters.map((chapter) => ({
        ...chapter,
        mediaReferences: source.mediaReferences,
      })),
    };
  } catch {
    return {
      ...base,
      overview: buildFallbackOverview(input, source),
      chapters: buildFallbackChapters(source),
    };
  }
}

async function writeAiStorybook(title: string, source: StorySource) {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      system: [
        'You turn family chat history into a warm storybook.',
        'Write engaging narrative prose, not a transcript or bullet-point summary.',
        'The grandmother is the main storyteller and the child asks follow-up questions.',
        'Shape the story around what grandma remembers, what happened, and why it mattered.',
        'Use only facts from the supplied chat text and media transcripts.',
        'If an audio or video item has no transcript, mention only that a recording was saved.',
        'Do not invent events, places, ages, names, or feelings.',
        'Return valid JSON only.',
      ].join(' '),
      prompt: [
        `Book title: ${title}`,
        'Write 2-4 short chapters from this source material, like a gentle family memoir.',
        'JSON shape: {"overview":"...","chapters":[{"title":"...","prose":["paragraph"],"sourceNotes":["short evidence note"]}]}',
        '',
        'Source material:',
        source.lines.join('\n'),
      ].join('\n'),
    },
  });

  if (error) throw error;
  return parseAiBookDraft(String(data?.text ?? ''));
}

type StorySource = {
  lines: string[];
  mediaReferences: string[];
};

function buildSource(input: ChatBookInput, messages: DirectChatMessage[]): StorySource {
  const mediaReferences: string[] = [];
  const lines = messages.map((message) => {
    const speaker = message.isMine ? input.myName : input.contact.displayName;
    const sentAt = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(message.createdAt));
    const body = message.body.trim();

    if (message.mediaType && message.mediaUrl) {
      const mediaLabel = message.mediaType === 'audio' ? 'audio/soundtrack' : 'video';
      mediaReferences.push(`${mediaLabel} from ${speaker}: ${message.mediaUrl}`);
      return body
        ? `${sentAt} - ${speaker} shared a ${mediaLabel}. Transcript: ${cleanTranscript(body)}`
        : `${sentAt} - ${speaker} shared a ${mediaLabel}, but no transcript was saved.`;
    }

    return `${sentAt} - ${speaker}: ${body}`;
  });

  return { lines, mediaReferences };
}

function cleanTranscript(value: string) {
  return value.replace(/^Story transcript:\s*/i, '').trim();
}

function buildFallbackOverview(input: ChatBookInput, source: StorySource) {
  return [
    `${input.myName} and ${input.contact.displayName} saved a family conversation as a storybook draft.`,
    'The AI story writer was not available, so this version uses a simple narrative from the saved chat text.',
    source.mediaReferences.length > 0
      ? 'Audio and video references are listed after the chapters.'
      : 'No audio or video references were found.',
  ].join(' ');
}

function buildFallbackChapters(source: StorySource): ChatBookChapter[] {
  const prose = source.lines
    .filter((line) => !line.includes('no transcript was saved'))
    .slice(0, 8)
    .map((line) => line.replace(/^.*? - /, ''));

  return [
    {
      title: 'Chapter 1: A Saved Conversation',
      prose:
        prose.length > 0
          ? prose
          : ['A family recording was saved, but there was not enough transcript text to write a full chapter.'],
      sourceNotes: ['Generated from saved chat text and available media transcripts.'],
      mediaReferences: source.mediaReferences,
    },
  ];
}
