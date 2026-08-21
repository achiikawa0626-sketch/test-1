const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-3.7-flash';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: unknown }>;
    };
  }>;
};

type AiMediaInput = {
  mimeType?: unknown;
  data?: unknown;
};

type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use a POST request.' }, 405);

  try {
    const body = (await req.json()) as {
      prompt?: unknown;
      system?: unknown;
      media?: unknown;
    };
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const system = typeof body.system === 'string' ? body.system.trim() : '';
    const mediaParts = readMediaParts(body.media);

    if (!prompt) return json({ error: 'Write a prompt for AI.' }, 400);
    if (prompt.length > 10_000 || system.length > 5_000) {
      return json({ error: 'The AI request is too long. Make it shorter.' }, 400);
    }
    if (!GEMINI_API_KEY) return json({ text: fallbackText(prompt, system) });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents: [{ parts: [{ text: prompt }, ...mediaParts] }],
        }),
      },
    );

    const data = (await response.json()) as GeminiResponse;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (response.ok && typeof text === 'string' && text.trim()) return json({ text });
    console.error('Gemini request failed', response.status, data);
    return json({ text: fallbackText(prompt, system) });
  } catch (error) {
    console.error('AI function failed', error);
    return json({ text: fallbackText('', '') });
  }
});

function readMediaParts(value: unknown): GeminiPart[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const media = item as AiMediaInput;
    const mimeType = typeof media.mimeType === 'string' ? media.mimeType : '';
    const data = typeof media.data === 'string' ? media.data : '';

    if (!mimeType || !data) return [];
    return [{ inlineData: { mimeType, data } }];
  });
}

function fallbackText(prompt: string, system: string) {
  const lowerPrompt = prompt.toLowerCase();
  const lowerSystem = system.toLowerCase();

  if (lowerPrompt.includes('transcribe') && lowerPrompt.includes('video')) {
    return '';
  }
  if (lowerPrompt.includes('transcribe')) return '';
  if (lowerSystem.includes('storybook')) return fallbackBook(prompt);
  if (lowerSystem.includes('follow-up questions')) return fallbackQuestions(prompt);

  return JSON.stringify({
    answer: 'I heard you. Tell me a little more, and I will help you answer kindly.',
    followUpQuestions: ['What happened?', 'How did it feel?', 'What changed?'],
  });
}

function fallbackQuestions(prompt: string) {
  const latestMessage = extractLatestMessage(prompt);
  const lowerMessage = latestMessage.toLowerCase();

  if (hasAny(lowerMessage, ['toy', 'игруш'])) {
    return JSON.stringify({
      questions: [
        hasAny(lowerMessage, ['lost', 'потер'])
          ? 'Where did you lose them?'
          : 'Which toy was favorite?',
        'Who played with you?',
        'How did it feel?',
        'What did it look like?',
      ],
    });
  }

  if (hasAny(lowerMessage, ['birthday', 'день рождения'])) {
    return JSON.stringify({
      questions: [
        'Who came that day?',
        'What gift did you love?',
        'How did you celebrate?',
      ],
    });
  }

  if (hasAny(lowerMessage, ['father', 'dad', 'пап'])) {
    return JSON.stringify({
      questions: [
        'What did he say?',
        'How did he help?',
        'What do you remember?',
      ],
    });
  }

  return JSON.stringify({
    questions: [
      'What do you remember?',
      'How did you feel?',
      'Who was with you?',
    ],
  });
}

function fallbackBook(prompt: string) {
  const source = prompt.split('Source material:').at(-1)?.trim() || 'A family memory was shared.';
  const cleanSource = source.replace(/\s+/g, ' ').slice(0, 800);

  return JSON.stringify({
    overview: 'A warm family memory collected from the chat.',
    chapters: [
      {
        title: 'A Shared Memory',
        prose: [cleanSource],
        sourceNotes: ['Based on the shared chat memory.'],
      },
    ],
  });
}

function extractLatestMessage(prompt: string) {
  const match = prompt.match(/Grandmother's latest message:\s*([\s\S]*?)\nRecent chat context:/i);
  return match?.[1]?.trim() ?? prompt;
}

function hasAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle));
}
