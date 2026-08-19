import { homeLanguages } from '../lib/homeTranslations';
import type { HomeLanguage } from '../lib/homeTranslations';

type LanguageSwitcherProps = {
  language: HomeLanguage;
  onChange: (language: HomeLanguage) => void;
};

export function LanguageSwitcher({ language, onChange }: LanguageSwitcherProps) {
  return (
    <div className="home-language-switcher" aria-label="Page language">
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
