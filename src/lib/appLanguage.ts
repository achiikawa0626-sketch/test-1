import { useEffect, useState } from 'react';
import type { HomeLanguage } from './homeTranslations';

const STORAGE_KEY = 'askgrandma-language';
const FRENCH_DEFAULT_KEY = 'askgrandma-french-default-ready';
const DEFAULT_LANGUAGE: HomeLanguage = 'fr';
const LANGUAGES: HomeLanguage[] = ['en', 'es', 'ru', 'fr', 'kk'];

function isHomeLanguage(value: string | null): value is HomeLanguage {
  return LANGUAGES.includes(value as HomeLanguage);
}

function readStoredLanguage(): HomeLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  if (window.localStorage.getItem(FRENCH_DEFAULT_KEY) !== 'yes') {
    window.localStorage.setItem(FRENCH_DEFAULT_KEY, 'yes');
    window.localStorage.setItem(STORAGE_KEY, DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isHomeLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

export function useAppLanguage() {
  const [language, setLanguageState] = useState<HomeLanguage>(readStoredLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  return [language, setLanguageState] as const;
}
