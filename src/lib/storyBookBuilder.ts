import type { ChatBook, ChatBookChapter } from './chatBook';
import type { HomeLanguage } from './homeTranslations';
import { storyBookLabels } from './storyBookLabels';

type StoryBookInput = {
  title: string;
  authorLine: string;
  language: HomeLanguage;
  sourceText: string;
  sourceName: string;
};

const MAX_CHAPTERS = 5;
const MIN_CHAPTER_LENGTH = 260;

export function buildBookFromText(input: StoryBookInput): ChatBook {
  const sections = splitIntoSections(input.sourceText);
  const chapters = sections.map((section, index) =>
    buildChapter(section, index, input.sourceName, input.language),
  );

  return {
    title: input.title,
    authorLine: input.authorLine,
    overview: buildOverview(input.sourceName, sections, input.language),
    chapters,
    language: input.language,
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

function buildChapter(
  text: string,
  index: number,
  sourceName: string,
  language: HomeLanguage,
): ChatBookChapter {
  const paragraphs = splitIntoParagraphs(text);
  const chapterNumber = index + 1;
  const textLabels = storyBookLabels[language];

  return {
    title: chapterTitle(text, chapterNumber, language),
    prose: paragraphs,
    sourceNotes: [
      textLabels.sourceNote(chapterNumber, sourceName),
      `${textLabels.mainDetail}: ${firstSentence(text)}`,
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

function chapterTitle(text: string, chapterNumber: number, language: HomeLanguage) {
  const sentence = firstSentence(text);
  const words = sentence.split(/\s+/).slice(0, 8).join(' ');
  const prefix = `${storyBookLabels[language].chapter} ${chapterNumber}`;
  return words ? `${prefix}: ${titleCase(stripEndPunctuation(words))}` : prefix;
}

function buildOverview(sourceName: string, sections: string[], language: HomeLanguage) {
  const detail = firstSentence(sections[0] ?? '');
  return detail
    ? storyBookLabels[language].overview(sourceName, detail)
    : storyBookLabels[language].emptyOverview(sourceName);
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
