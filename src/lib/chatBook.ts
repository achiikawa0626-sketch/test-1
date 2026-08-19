import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';

type ChatBookInput = {
  contact: FamilyProfile;
  messages: DirectChatMessage[];
  myName: string;
};

export type ChatBookChapter = {
  title: string;
  summary: string;
  participants: string[];
  places: string[];
  keyMoments: string[];
  transcript: string[];
  mediaReferences: string[];
};

export type ChatBook = {
  title: string;
  authorLine: string;
  overview: string;
  chapters: ChatBookChapter[];
};

export function generateChatBook(input: ChatBookInput): ChatBook {
  const bookMessages = input.messages.filter((message) => message.body.trim() || message.mediaUrl);
  if (bookMessages.length === 0) {
    throw new Error('There are no chat messages or media references to turn into a book yet.');
  }

  const chapters = buildChapters({ ...input, messages: bookMessages });
  return {
    title: `${input.contact.displayName} and ${input.myName}`,
    authorLine: `A family storybook for ${input.myName} and ${input.contact.displayName}`,
    overview: buildOverview(input, chapters),
    chapters,
  };
}

function buildChapters(input: ChatBookInput) {
  return Object.entries(groupMessagesByDay(input.messages)).map(([day, messages], index) => {
    const participants = [input.myName, input.contact.displayName];
    const transcript = messages.map((message) => formatTranscriptLine(input, message));
    const mediaReferences = messages.flatMap((message) => formatMediaReference(input, message));
    const keyMoments = extractKeyMoments(messages);
    const places = extractPlaces(messages);

    return {
      title: `Chapter ${index + 1}: ${day}`,
      summary: buildChapterSummary(messages, participants, places, mediaReferences),
      participants,
      places,
      keyMoments,
      transcript,
      mediaReferences,
    };
  });
}

function buildOverview(input: ChatBookInput, chapters: ChatBookChapter[]) {
  const mediaCount = chapters.reduce((total, chapter) => total + chapter.mediaReferences.length, 0);
  return [
    'This storybook was compiled from real AskGrandma chat history.',
    `It includes ${chapters.length} chapter${chapters.length === 1 ? '' : 's'} between ${input.myName} and ${input.contact.displayName}.`,
    mediaCount > 0
      ? `It also preserves ${mediaCount} audio or video reference${mediaCount === 1 ? '' : 's'} from the chat.`
      : 'No audio or video references were found in this export.',
  ].join(' ');
}

function buildChapterSummary(
  messages: DirectChatMessage[],
  participants: string[],
  places: string[],
  mediaReferences: string[],
) {
  const textCount = messages.filter((message) => message.body.trim()).length;
  const placeLine = places.length > 0 ? ` Places mentioned: ${places.join(', ')}.` : '';
  const mediaLine =
    mediaReferences.length > 0 ? ` Media references: ${mediaReferences.length}.` : '';

  return `${participants.join(' and ')} shared ${textCount} written message${textCount === 1 ? '' : 's'} in this chapter.${placeLine}${mediaLine}`;
}

function formatTranscriptLine(input: ChatBookInput, message: DirectChatMessage) {
  const speaker = message.isMine ? input.myName : input.contact.displayName;
  const sentAt = new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(message.createdAt));
  const body = message.body.trim() || `[${message.mediaType ?? 'media'} message]`;
  return `${sentAt} - ${speaker}: ${body}`;
}

function formatMediaReference(input: ChatBookInput, message: DirectChatMessage) {
  if (!message.mediaType || !message.mediaUrl) return [];

  const speaker = message.isMine ? input.myName : input.contact.displayName;
  const label = message.mediaType === 'audio' ? 'Audio/soundtrack' : 'Video';
  return [`${label} from ${speaker}: ${message.mediaUrl}`];
}

function extractKeyMoments(messages: DirectChatMessage[]) {
  const moments = messages
    .map((message) => message.body.trim())
    .filter(Boolean)
    .filter((body) => !body.endsWith('?'))
    .map((body) => firstSentence(body))
    .filter((body) => body.length > 12);

  return unique(moments).slice(0, 5);
}

function extractPlaces(messages: DirectChatMessage[]) {
  const placeMatches = messages.flatMap((message) => {
    const body = message.body.trim();
    return [...body.matchAll(/\b(?:in|at|from|near|to)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,2})/g)]
      .map((match) => match[1])
      .filter(Boolean);
  });

  return unique(placeMatches).slice(0, 6);
}

function firstSentence(value: string) {
  return value.split(/[.!?]/)[0].trim();
}

function unique(values: string[]) {
  return [...new Set(values)];
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
