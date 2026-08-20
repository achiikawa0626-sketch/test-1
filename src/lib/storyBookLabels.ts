import type { HomeLanguage } from './homeTranslations';

export type StoryBookLabelSet = {
  chapter: string;
  sourceNote: (chapterNumber: number, sourceName: string) => string;
  mainDetail: string;
  overview: (sourceName: string, detail: string) => string;
  emptyOverview: (sourceName: string) => string;
};

export const storyBookLabels: Record<HomeLanguage, StoryBookLabelSet> = {
  en: {
    chapter: 'Chapter',
    sourceNote: (chapterNumber, sourceName) =>
      `Chapter ${chapterNumber} uses only ${sourceName}'s original written details.`,
    mainDetail: 'Main detail',
    overview: (sourceName, detail) => `${sourceName}'s story begins with this real detail: ${detail}`,
    emptyOverview: (sourceName) => `${sourceName}'s words are collected here as a short family book.`,
  },
  es: {
    chapter: 'Capítulo',
    sourceNote: (chapterNumber, sourceName) =>
      `El capítulo ${chapterNumber} usa solo los detalles originales escritos por ${sourceName}.`,
    mainDetail: 'Detalle principal',
    overview: (sourceName, detail) =>
      `La historia de ${sourceName} empieza con este detalle real: ${detail}`,
    emptyOverview: (sourceName) =>
      `Las palabras de ${sourceName} se reúnen aquí como un libro familiar corto.`,
  },
  ru: {
    chapter: 'Глава',
    sourceNote: (chapterNumber, sourceName) =>
      `Глава ${chapterNumber} использует только исходные письменные детали от ${sourceName}.`,
    mainDetail: 'Главная деталь',
    overview: (sourceName, detail) =>
      `История ${sourceName} начинается с этой реальной детали: ${detail}`,
    emptyOverview: (sourceName) =>
      `Слова ${sourceName} собраны здесь как короткая семейная книга.`,
  },
  fr: {
    chapter: 'Chapitre',
    sourceNote: (chapterNumber, sourceName) =>
      `Le chapitre ${chapterNumber} utilise seulement les détails écrits par ${sourceName}.`,
    mainDetail: 'Détail principal',
    overview: (sourceName, detail) =>
      `L’histoire de ${sourceName} commence par ce vrai détail : ${detail}`,
    emptyOverview: (sourceName) =>
      `Les mots de ${sourceName} sont réunis ici dans un court livre familial.`,
  },
  kk: {
    chapter: 'Тарау',
    sourceNote: (chapterNumber, sourceName) =>
      `${chapterNumber}-тарау тек ${sourceName} жазған нақты мәліметтерді қолданады.`,
    mainDetail: 'Негізгі мәлімет',
    overview: (sourceName, detail) =>
      `${sourceName} оқиғасы осы нақты мәліметтен басталады: ${detail}`,
    emptyOverview: (sourceName) =>
      `${sourceName} сөздері қысқа отбасылық кітап ретінде осында жиналды.`,
  },
};
