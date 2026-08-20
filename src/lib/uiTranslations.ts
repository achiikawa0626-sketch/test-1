import type { HomeLanguage } from './homeTranslations';
import { kkUiText, ruUiText } from './uiTranslationsCyrillic';
import { enUiText, esUiText, frUiText } from './uiTranslationsLatin';

export function uiText(language: HomeLanguage) {
  if (language === 'es') return esUiText;
  if (language === 'ru') return ruUiText;
  if (language === 'fr') return frUiText;
  if (language === 'kk') return kkUiText;
  return enUiText;
}
