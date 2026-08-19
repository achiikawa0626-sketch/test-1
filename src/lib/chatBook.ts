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
        'You are a children-and-family storybook writer.',
        'Transform family chat history into immersive story chapters, not an overview, summary, transcript, or report.',
        'Grandma is the main character inside her own memory. The child questions are only clues about what story to tell.',
        'Write scenes with a beginning, middle, and ending: show what grandma did, what changed, and why the memory mattered.',
        'Use gentle fiction-style narration based only on supplied facts. You may add small sensory details that fit the facts, but do not invent major events, names, places, ages, relatives, or outcomes.',
        'Never write phrases like "in the chat", "the conversation", "grandma said", "the transcript", or "source material".',
        'If an audio or video item has a transcript, use the transcript as story material. If it has no transcript, do not guess what happened inside it.',
        'Return valid JSON only.',
      ].join(' '),
      prompt: [
        `Book title: ${title}`,
        'Write 2-4 short chapters. Each chapter should feel like a real story scene from grandma’s past.',
        'Example style: if grandma says her most exciting day was learning to ride a bike at 14, write a chapter about fourteen-year-old grandma on that day: the bicycle, the first wobble, the fear, the moment she balanced, and the joy afterward.',
        'Do not list messages. Do not summarize the chat. Do not explain that you are making a book.',
        'Make prose warm, vivid, and readable for a teenager, with 2-4 paragraphs per chapter.',
        'The overview should sound like a back-cover blurb for the story, not a summary of the chat.',
        'JSON shape: {"overview":"...","chapters":[{"title":"...","prose":["paragraph"],"sourceNotes":["short evidence note"]}]}',
        '',
        'Facts and transcripts to base the story on:',
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
    .map((line) => line.replace(/^.*? - .*?: /, '').replace(/^.*? - /, '').trim())
    .filter(Boolean);

  return [
    {
      title: 'Chapter 1: A Memory Saved',
      prose:
        prose.length > 0
          ? [
              'A memory began to take shape from the family messages: small details, favorite days, and the kind of moments that are easy to lose if nobody asks.',
              prose.join(' '),
              'It was only a draft, waiting for the story writer to turn it into a fuller chapter.',
            ]
          : ['A family recording was saved, but there was not enough transcript text to write a full chapter.'],
      sourceNotes: ['Generated from saved chat text and available media transcripts.'],
      mediaReferences: source.mediaReferences,
    },
  ];
}
