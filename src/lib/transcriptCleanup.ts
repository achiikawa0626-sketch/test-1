import { supabase } from './supabase';

export async function cleanRecordedTranscript(rawTranscript: string) {
  const transcript = localTranscriptCleanup(rawTranscript);
  if (!transcript) return '';

  try {
    const { data, error } = await supabase.functions.invoke('ai', {
      body: {
        system: [
          'You clean speech-to-text transcripts.',
          'Fix grammar, word endings, punctuation, and obvious recognition mistakes.',
          'Preserve the original language. Do not translate.',
          'Do not add new facts, names, places, animals, or events.',
          'Return strict JSON only: {"transcript":"cleaned transcript"}',
        ].join(' '),
        prompt: transcript,
      },
    });

    if (error || typeof data?.text !== 'string') return transcript;
    return parseCleanTranscript(data.text) || transcript;
  } catch {
    return transcript;
  }
}

function parseCleanTranscript(value: string) {
  try {
    const parsed = JSON.parse(extractJson(value)) as unknown;
    const transcript = (parsed as { transcript?: unknown }).transcript;
    return typeof transcript === 'string' ? localTranscriptCleanup(transcript) : '';
  } catch {
    return localTranscriptCleanup(value);
  }
}

function extractJson(value: string) {
  return value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? value.trim();
}

function localTranscriptCleanup(value: string) {
  return value
    .replace(/^Story transcript:\s*/i, '')
    .replace(/\bлюбила\s+игра\b/gi, 'любила играть')
    .replace(/\bлюбил\s+игра\b/gi, 'любил играть')
    .replace(/\s+/g, ' ')
    .trim();
}
