import type { ChatBook, ChatBookChapter } from './chatBook';

type StoryBookInput = {
  title: string;
  authorLine: string;
  sourceText: string;
  sourceName: string;
};

const MAX_CHAPTERS = 5;
const MIN_CHAPTER_LENGTH = 260;

export function buildBookFromText(input: StoryBookInput): ChatBook {
  const sections = splitIntoSections(input.sourceText);
  const chapters = sections.map((section, index) => buildChapter(section, index, input.sourceName));

  return {
    title: input.title,
    authorLine: input.authorLine,
    overview: buildOverview(input.sourceName, sections),
    chapters,
  };
}

function splitIntoSections(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map(cleanLine)
    .filter(Boolean);
  const units = paragraphs.length > 1 ? paragraphs : splitIntoSentences(text);
  const chapterCount = Math.min(MAX_CHAPTERS, Math.max(1, Math.ceil(text.length / 900)));
  const targetLength = Math.max(MIN_CHAPTER_LENGTH, Math.ceil(text.length / chapterCount));
  const sections: string[] = [];
  let current = '';

  units.forEach((unit) => {
    const next = current ? `${current}\n\n${unit}` : unit;
    if (current && next.length > targetLength && sections.length < MAX_CHAPTERS - 1) {
      sections.push(current);
      current = unit;
    } else {
      current = next;
    }
  });

  if (current) sections.push(current);
  return sections;
}

function buildChapter(text: string, index: number, sourceName: string): ChatBookChapter {
  const paragraphs = splitIntoParagraphs(text);

  return {
    title: chapterTitle(text, index),
    prose: paragraphs,
    sourceNotes: [
      `Chapter ${index + 1} uses only ${sourceName}'s original written details.`,
      `Main detail: ${firstSentence(text)}`,
    ],
    mediaReferences: [],
  };
}

function splitIntoParagraphs(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map(cleanLine)
    .filter(Boolean);

  if (paragraphs.length > 0) return paragraphs;
  return splitIntoSentences(text);
}

function splitIntoSentences(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(cleanLine)
    .filter(Boolean);
}

function chapterTitle(text: string, index: number) {
  const sentence = firstSentence(text);
  const words = sentence.split(/\s+/).slice(0, 8).join(' ');
  return words ? `Chapter ${index + 1}: ${titleCase(stripEndPunctuation(words))}` : `Chapter ${index + 1}`;
}

function buildOverview(sourceName: string, sections: string[]) {
  const detail = firstSentence(sections[0] ?? '');
  return detail
    ? `${sourceName}'s story begins with this real detail: ${detail}`
    : `${sourceName}'s words are collected here as a short family book.`;
}

function firstSentence(text: string) {
  return splitIntoSentences(text)[0] ?? cleanLine(text).slice(0, 140);
}

function stripEndPunctuation(text: string) {
  return text.replace(/[.!?,;:]+$/g, '');
}

function titleCase(text: string) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function cleanLine(text: string) {
  return text.trim().replace(/\s+/g, ' ');
}
