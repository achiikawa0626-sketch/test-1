import type { ChatBook } from './chatBook';
import type { HomeLanguage } from './homeTranslations';
import { buildBookFromText } from './storyBookBuilder';
import { textBookTranslations } from './textBookTranslations';

export type TextBookInput = {
  language: HomeLanguage;
  title: string;
  grandmaName: string;
  sourceText: string;
};

const authorLines: Record<HomeLanguage, (name: string) => string> = {
  en: (name) => `A book made only from ${name}'s words`,
  es: (name) => `Un libro hecho solo con las palabras de ${name}`,
  ru: (name) => `Книга, созданная только из слов ${name}`,
  fr: (name) => `Un livre créé seulement avec les mots de ${name}`,
  kk: (name) => `${name} сөздерінен ғана жасалған кітап`,
};

const longerStoryMessages: Record<HomeLanguage, string> = {
  en: 'Paste a longer story from grandma first.',
  es: 'Primero pega una historia más larga de la abuela.',
  ru: 'Сначала вставьте более длинную историю от бабушки.',
  fr: 'Collez d’abord une histoire plus longue de grand-mère.',
  kk: 'Алдымен әженің ұзағырақ оқиғасын қойыңыз.',
};

export async function generateTextBook(input: TextBookInput): Promise<ChatBook> {
  const sourceText = input.sourceText.trim();
  if (sourceText.length < 40) {
    throw new Error(longerStoryMessages[input.language]);
  }

  const text = textBookTranslations[input.language];
  const grandmaName = input.grandmaName.trim() || text.grandmaNamePlaceholder;
  const title = input.title.trim() || text.bookTitlePlaceholder;

  return buildBookFromText({
    title,
    authorLine: authorLines[input.language](grandmaName),
    language: input.language,
    sourceName: grandmaName,
    sourceText,
  });
}
