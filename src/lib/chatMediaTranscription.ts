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

export async function readChatMediaSource(input: {
  url: string;
  mediaType: DirectChatMessage['mediaType'];
  speaker: string;
  sentAt: string;
}): Promise<ChatMediaSource> {
  const mediaLabel = input.mediaType === 'audio' ? 'audio' : 'video';
  const reference = `${mediaLabel} from ${input.speaker} on ${input.sentAt}`;
  const mediaPart = await loadMediaPart(input.url, input.mediaType);
  const transcript = mediaPart ? await transcribeMedia(mediaPart, mediaLabel) : undefined;

  return { mediaPart, reference, transcript };
}

async function transcribeMedia(mediaPart: AiMediaPart, mediaLabel: string) {
  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      system:
        'You are a careful audio transcription assistant. Transcribe only what people say. Do not summarize, add story language, or invent missing words.',
      prompt: `Transcribe this ${mediaLabel}. Return plain text only. If you cannot understand it, return an empty string.`,
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
