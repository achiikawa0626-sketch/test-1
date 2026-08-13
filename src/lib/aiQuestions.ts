import { supabase } from './supabase';

type AiFunctionResponse = {
  text?: string;
};

export async function generateFollowUpQuestions(storyText: string) {
  const trimmedStory = storyText.trim();
  if (!trimmedStory) {
    throw new Error('Start the chat first, then AI can suggest follow-up questions.');
  }

  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      system:
        'You help children ask warm, respectful follow-up questions to older family members. Return only 4 short questions, one per line. No numbering, no extra text.',
      prompt: `Create follow-up questions based on this family story/chat:\n\n${trimmedStory}`,
    },
  });

  if (error) {
    throw new Error('AI questions are not ready yet. Deploy the AI function first.');
  }

  const response = data as AiFunctionResponse;
  return parseQuestions(response.text ?? '');
}

function parseQuestions(text: string) {
  return text
    .split('\n')
    .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean)
    .map((line) => (line.endsWith('?') ? line : `${line}?`))
    .slice(0, 4);
}
