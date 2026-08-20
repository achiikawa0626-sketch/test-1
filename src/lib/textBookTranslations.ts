import type { HomeLanguage } from './homeTranslations';

export type TextBookTranslation = {
  backButton: string;
  pageTitle: string;
  pageIntro: string;
  sourceTitle: string;
  bookTitleLabel: string;
  bookTitlePlaceholder: string;
  grandmaNameLabel: string;
  grandmaNamePlaceholder: string;
  grandmaTextLabel: string;
  grandmaTextPlaceholder: string;
  createButton: string;
  writingButton: string;
  createdMessage: string;
  createError: string;
  emptyTitle: string;
  emptyText: string;
  preparingBook: string;
  downloadBook: string;
};

export const textBookTranslations: Record<HomeLanguage, TextBookTranslation> = {
  en: {
    backButton: 'Back',
    pageTitle: "Turn grandma's text into a book",
    pageIntro: 'Paste her words, then create a faithful book from the real details.',
    sourceTitle: 'Source text',
    bookTitleLabel: 'Book title',
    bookTitlePlaceholder: "Grandma's Story",
    grandmaNameLabel: 'Grandma name',
    grandmaNamePlaceholder: 'Grandma',
    grandmaTextLabel: "Grandma's text",
    grandmaTextPlaceholder: 'Paste exactly what grandma wrote here.',
    createButton: 'Create book',
    writingButton: 'Writing book...',
    createdMessage: "Book created from grandma's text.",
    createError: 'Could not create the book.',
    emptyTitle: 'Your book will appear here',
    emptyText: 'It will include chapters, story paragraphs, and source notes.',
    preparingBook: 'Preparing book...',
    downloadBook: 'Download book',
  },
  es: {
    backButton: 'Volver',
    pageTitle: 'Convierte el texto de la abuela en un libro',
    pageIntro: 'Pega sus palabras y crea un libro fiel a los detalles reales.',
    sourceTitle: 'Texto original',
    bookTitleLabel: 'Título del libro',
    bookTitlePlaceholder: 'Historia de la abuela',
    grandmaNameLabel: 'Nombre de la abuela',
    grandmaNamePlaceholder: 'Abuela',
    grandmaTextLabel: 'Texto de la abuela',
    grandmaTextPlaceholder: 'Pega exactamente lo que escribió la abuela.',
    createButton: 'Crear libro',
    writingButton: 'Escribiendo libro...',
    createdMessage: 'Libro creado desde el texto de la abuela.',
    createError: 'No se pudo crear el libro.',
    emptyTitle: 'Tu libro aparecerá aquí',
    emptyText: 'Incluirá capítulos, párrafos de historia y notas de fuente.',
    preparingBook: 'Preparando libro...',
    downloadBook: 'Descargar libro',
  },
  ru: {
    backButton: 'Назад',
    pageTitle: 'Превратите текст бабушки в книгу',
    pageIntro: 'Вставьте ее слова и создайте книгу, верную реальным деталям.',
    sourceTitle: 'Исходный текст',
    bookTitleLabel: 'Название книги',
    bookTitlePlaceholder: 'История бабушки',
    grandmaNameLabel: 'Имя бабушки',
    grandmaNamePlaceholder: 'Бабушка',
    grandmaTextLabel: 'Текст бабушки',
    grandmaTextPlaceholder: 'Вставьте именно то, что написала бабушка.',
    createButton: 'Создать книгу',
    writingButton: 'Создаем книгу...',
    createdMessage: 'Книга создана из текста бабушки.',
    createError: 'Не удалось создать книгу.',
    emptyTitle: 'Ваша книга появится здесь',
    emptyText: 'В ней будут главы, абзацы истории и заметки об источнике.',
    preparingBook: 'Готовим книгу...',
    downloadBook: 'Скачать книгу',
  },
  fr: {
    backButton: 'Retour',
    pageTitle: 'Transformez le texte de grand-mère en livre',
    pageIntro: 'Collez ses mots et créez un livre fidèle aux vrais détails.',
    sourceTitle: 'Texte source',
    bookTitleLabel: 'Titre du livre',
    bookTitlePlaceholder: 'Histoire de grand-mère',
    grandmaNameLabel: 'Nom de grand-mère',
    grandmaNamePlaceholder: 'Grand-mère',
    grandmaTextLabel: 'Texte de grand-mère',
    grandmaTextPlaceholder: 'Collez exactement ce que grand-mère a écrit.',
    createButton: 'Créer le livre',
    writingButton: 'Écriture du livre...',
    createdMessage: 'Livre créé à partir du texte de grand-mère.',
    createError: 'Impossible de créer le livre.',
    emptyTitle: 'Votre livre apparaîtra ici',
    emptyText: 'Il inclura des chapitres, des paragraphes et des notes de source.',
    preparingBook: 'Préparation du livre...',
    downloadBook: 'Télécharger le livre',
  },
  kk: {
    backButton: 'Артқа',
    pageTitle: 'Әженің мәтінінен кітап жасау',
    pageIntro: 'Әженің сөздерін қойыңыз, кітап нақты мәліметтерге сүйеніп жасалады.',
    sourceTitle: 'Бастапқы мәтін',
    bookTitleLabel: 'Кітап атауы',
    bookTitlePlaceholder: 'Әженің оқиғасы',
    grandmaNameLabel: 'Әженің аты',
    grandmaNamePlaceholder: 'Әже',
    grandmaTextLabel: 'Әженің мәтіні',
    grandmaTextPlaceholder: 'Әже жазған мәтінді дәл осында қойыңыз.',
    createButton: 'Кітап жасау',
    writingButton: 'Кітап жазылуда...',
    createdMessage: 'Кітап әженің мәтінінен жасалды.',
    createError: 'Кітап жасау мүмкін болмады.',
    emptyTitle: 'Кітабыңыз осында шығады',
    emptyText: 'Онда тараулар, оқиға мәтіні және дерек ескертпелері болады.',
    preparingBook: 'Кітап дайындалуда...',
    downloadBook: 'Кітапты жүктеу',
  },
};
