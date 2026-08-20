import { Link } from 'wouter';
import { Auth } from '../components/Auth';
import { useAppLanguage } from '../lib/appLanguage';
import { uiText } from '../lib/uiTranslations';

export function LoginPage() {
  const [language] = useAppLanguage();
  const text = uiText(language);

  return (
    <main className="container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <h1>{text.loginTitle}</h1>
        <p>{text.loginHelp}</p>
      </header>
      <Auth />
    </main>
  );
}
