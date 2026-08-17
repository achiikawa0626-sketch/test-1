import { loadDirectChat } from './directChat';
import type { FamilyProfile } from './familyConnections';
import { supabase } from './supabase';

export async function generateFollowUpQuestion(contacts: FamilyProfile[]) {
  const answer = await findLatestAnswer(contacts);
  if (!answer) return '';

  const { data, error } = await supabase.functions.invoke('ai', {
    body: {
      prompt: answer,
      system:
        'Write one warm follow-up question a child can ask their grandparent. Base it on the answer. Return only the question.',
    },
  });

  if (error) return '';
  return typeof data?.text === 'string' ? cleanQuestion(data.text) : '';
}

async function findLatestAnswer(contacts: FamilyProfile[]) {
  for (const contact of contacts) {
    const messages = await loadDirectChat(contact.id);
    const answer = [...messages]
      .reverse()
      .find((message) => !message.isMine && message.body.trim());

    if (answer) return answer.body;
  }

  return '';
}

function cleanQuestion(text: string) {
  return text
    .replace(/^["']|["']$/g, '')
    .trim()
    .slice(0, 180);
}
