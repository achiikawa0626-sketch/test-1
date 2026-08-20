import type { HomeLanguage } from './homeTranslations';

const BAD_WORDS = ['admin', 'support', 'moderator', 'fuck', 'shit', 'bitch', 'dick', 'asshole'];

const usernameMessages: Record<HomeLanguage, { format: string; kind: string }> = {
  en: {
    format: 'Username must be 3-20 letters, numbers, or underscores.',
    kind: 'Choose a kind username without bad words.',
  },
  es: {
    format: 'El usuario debe tener 3-20 letras, números o guiones bajos.',
    kind: 'Elige un usuario amable sin malas palabras.',
  },
  ru: {
    format: 'Имя пользователя: 3-20 букв, цифр или нижних подчеркиваний.',
    kind: 'Выберите доброе имя пользователя без плохих слов.',
  },
  fr: {
    format: 'Le nom d’utilisateur doit contenir 3-20 lettres, chiffres ou underscores.',
    kind: 'Choisissez un nom d’utilisateur gentil, sans gros mots.',
  },
  kk: {
    format: 'Қолданушы аты 3-20 әріп, сан немесе төменгі сызықтан тұруы керек.',
    kind: 'Жаман сөзсіз, жақсы қолданушы атын таңдаңыз.',
  },
};

export function validateUsername(username: string, language: HomeLanguage = 'en') {
  const value = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(value)) {
    return usernameMessages[language].format;
  }

  if (BAD_WORDS.some((word) => value.includes(word))) {
    return usernameMessages[language].kind;
  }

  return '';
}
