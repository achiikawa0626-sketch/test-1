import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';

type ChatBookInput = {
  contact: FamilyProfile;
  messages: DirectChatMessage[];
  myName: string;
};

export type ChatBook = {
  title: string;
  authorLine: string;
  body: string;
};

export function generateChatBook(input: ChatBookInput): ChatBook {
  const readableMessages = input.messages.filter((message) => message.body.trim());
  if (readableMessages.length === 0) {
    throw new Error('There are no text messages to turn into a book yet.');
  }

  return {
    title: `${input.contact.displayName} and ${input.myName}`,
    authorLine: `A family chat story for ${input.myName} and ${input.contact.displayName}`,
    body: buildBookBody({
      ...input,
      messages: readableMessages,
    }),
  };
}

function formatMessage(input: ChatBookInput, message: DirectChatMessage) {
  const speaker = message.isMine ? input.myName : input.contact.displayName;
  const sentAt = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(message.createdAt));

  return `${sentAt} - ${speaker}: ${message.body.trim()}`;
}

function buildBookBody(input: ChatBookInput) {
  const intro = [
    'This book draft was made from the real chat messages below.',
    'It keeps the original words and dates so nothing is invented.',
    'When the AI function is deployed, this can become a fuller novel-style version.',
  ].join(' ');

  const messagesByDay = groupMessagesByDay(input.messages);
  const chapters = Object.entries(messagesByDay).map(([day, messages]) => {
    const lines = messages.map((message) => formatMessage(input, message));
    return [`${day}`, ...lines].join('\n\n');
  });

  return [intro, ...chapters].join('\n\n');
}

function groupMessagesByDay(messages: DirectChatMessage[]) {
  return messages.reduce<Record<string, DirectChatMessage[]>>((groups, message) => {
    const day = new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(message.createdAt));

    groups[day] = [...(groups[day] ?? []), message];
    return groups;
  }, {});
}
