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

type AiMediaPart = {
  mimeType: string;
  data: string;
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
  const source = await buildSource(input, bookMessages);
  const draft = await writeAiStorybook(base.title, source);

  return {
    ...base,
    overview: draft.overview,
    chapters: draft.chapters.map((chapter) => ({
      ...chapter,
      mediaReferences: source.mediaReferences,
    })),
  };
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
        'Use facts from supplied chat text, transcripts, and attached audio/video files.',
        'Listen to attached audio and video. Use what is said there as story material.',
        'If a media file cannot be understood, do not guess its contents.',
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
        'Facts, transcripts, and attached media to base the story on:',
        source.lines.join('\n'),
      ].join('\n'),
      media: source.mediaParts,
    },
  });

  if (error) throw error;
  return parseAiBookDraft(String(data?.text ?? ''));
}

type StorySource = {
  lines: string[];
  mediaReferences: string[];
  mediaParts: AiMediaPart[];
};

async function buildSource(input: ChatBookInput, messages: DirectChatMessage[]): Promise<StorySource> {
  const mediaReferences: string[] = [];
  const mediaParts: AiMediaPart[] = [];
  const lines = await Promise.all(messages.map(async (message) => {
    const speaker = message.isMine ? input.myName : input.contact.displayName;
    const sentAt = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(message.createdAt));
    const body = message.body.trim();

    if (message.mediaType && message.mediaUrl) {
      const mediaLabel = message.mediaType === 'audio' ? 'audio/soundtrack' : 'video';
      mediaReferences.push(`${mediaLabel} from ${speaker}: ${message.mediaUrl}`);
      const mediaPart = await loadMediaPart(message.mediaUrl, message.mediaType);
      if (mediaPart) mediaParts.push(mediaPart);

      return body
        ? `${sentAt} - ${speaker} shared a ${mediaLabel}. Transcript: ${cleanTranscript(body)}`
        : `${sentAt} - ${speaker} shared a ${mediaLabel}. The file is attached for Gemini to read.`;
    }

    return `${sentAt} - ${speaker}: ${body}`;
  }));

  return { lines, mediaReferences, mediaParts };
}

function cleanTranscript(value: string) {
  return value.replace(/^Story transcript:\s*/i, '').trim();
}

async function loadMediaPart(url: string, mediaType: DirectChatMessage['mediaType']) {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;

    const blob = await response.blob();
    if (blob.size > 7_000_000) return undefined;

    return {
      mimeType: blob.type || (mediaType === 'video' ? 'video/webm' : 'audio/webm'),
      data: await blobToBase64(blob),
    };
  } catch {
    return undefined;
  }
}

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];

  for (let index = 0; index < bytes.length; index += 8192) {
    chunks.push(String.fromCharCode(...bytes.slice(index, index + 8192)));
  }

  return btoa(chunks.join(''));
}
