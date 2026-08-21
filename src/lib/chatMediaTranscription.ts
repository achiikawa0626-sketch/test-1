import type { DirectChatMessage } from './directChat';
import { supabase } from './supabase';

type AiMediaPart = {
  mimeType: string;
  data: string;
};

export type ChatMediaSource = {
  mediaPart?: AiMediaPart;
  reference: string;
  transcript?: string;
};

const transcriptCache = new Map<string, string | undefined>();
const pendingTranscripts = new Map<string, Promise<string | undefined>>();

export async function readChatMediaSource(input: {
  url: string;
  mediaType: DirectChatMessage['mediaType'];
  speaker: string;
  sentAt: string;
  cacheKey?: string;
}): Promise<ChatMediaSource> {
  const mediaLabel = input.mediaType === 'audio' ? 'audio' : 'video';
  const reference = `${mediaLabel} from ${input.speaker} on ${input.sentAt}`;
  const cacheKey = input.cacheKey ?? input.url;
  const cachedTranscript = readCachedTranscript(cacheKey);
  if (cachedTranscript !== null) return { reference, transcript: cachedTranscript };

  const mediaPart = await loadMediaPart(input.url, input.mediaType);
  const transcript = mediaPart
    ? await transcribeCachedMedia(cacheKey, mediaPart, mediaLabel)
    : undefined;

  return { mediaPart, reference, transcript };
}

async function transcribeCachedMedia(
  cacheKey: string,
  mediaPart: AiMediaPart,
  mediaLabel: string,
) {
  const pendingTranscript = pendingTranscripts.get(cacheKey);
  if (pendingTranscript) return pendingTranscript;

  const transcriptPromise = transcribeMedia(mediaPart, mediaLabel)
    .then((transcript) => {
      transcriptCache.set(cacheKey, transcript);
      saveCachedTranscript(cacheKey, transcript);
      return transcript;
    })
    .finally(() => pendingTranscripts.delete(cacheKey));

  pendingTranscripts.set(cacheKey, transcriptPromise);
  return transcriptPromise;
}

async function transcribeMedia(mediaPart: AiMediaPart, mediaLabel: string) {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      system:
        'You are a careful media transcription assistant. Do not summarize, add story language, or invent missing words.',
      prompt: `Transcribe only what people say in the original language. Use the ${mediaLabel} track, including speech in the video if present. Return plain text only. If you cannot understand it, return an empty string.`,
      media: [mediaPart],
    },
  });

  if (error || typeof data?.text !== 'string') return undefined;
  const transcript = data.text.replace(/^["']|["']$/g, '').trim();
  return transcript || undefined;
}

async function loadMediaPart(url: string, mediaType: DirectChatMessage['mediaType']) {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;

    const blob = await response.blob();
    if (blob.size > 10_000_000) return undefined;

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

function readCachedTranscript(cacheKey: string) {
  if (transcriptCache.has(cacheKey)) return transcriptCache.get(cacheKey);

  try {
    const cached = sessionStorage.getItem(transcriptStorageKey(cacheKey));
    if (cached === null) return null;
    const transcript = cached || undefined;
    transcriptCache.set(cacheKey, transcript);
    return transcript;
  } catch {
    return null;
  }
}

function saveCachedTranscript(cacheKey: string, transcript: string | undefined) {
  try {
    sessionStorage.setItem(transcriptStorageKey(cacheKey), transcript ?? '');
  } catch {
    return;
  }
}

function transcriptStorageKey(cacheKey: string) {
  return `ask-grandma-transcript:${cacheKey}`;
}
