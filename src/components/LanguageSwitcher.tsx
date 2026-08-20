import { homeLanguages } from '../lib/homeTranslations';
import type { HomeLanguage } from '../lib/homeTranslations';

const languageLabels: Record<HomeLanguage, string> = {
  en: 'Page language',
  es: 'Idioma de la página',
  ru: 'Язык страницы',
  fr: 'Langue de la page',
  kk: 'Бет тілі',
};

type LanguageSwitcherProps = {
  language: HomeLanguage;
  onChange: (language: HomeLanguage) => void;
};

export function LanguageSwitcher({ language, onChange }: LanguageSwitcherProps) {
  return (
    <div className="home-language-switcher" aria-label={languageLabels[language]}>
      {homeLanguages.map((code) => (
        <button
          className={language === code ? 'active' : ''}
          key={code}
          type="button"
          onClick={() => onChange(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
