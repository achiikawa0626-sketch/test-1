import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { HomeFamilyPreview } from '../components/HomeFamilyPreview';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useAppLanguage } from '../lib/appLanguage';
import { loadFamilyRequests } from '../lib/familyConnections';
import type { FamilyRequest } from '../lib/familyConnections';
import { homeTranslations } from '../lib/homeTranslations';
import { supabase } from '../lib/supabase';

export function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useAppLanguage();
  const text = homeTranslations[language];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
      if (!data.user) return;

      loadFamilyRequests()
        .then(setRequests)
        .catch((error: unknown) => {
          setMessage(error instanceof Error ? error.message : 'Could not load family.');
        });
    });
  }, []);

  return (
    <main className="home-page">
      <div className="home-shell">
        <section className="home-hero">
          <p className="home-hero__label">AskGrandma</p>
          <LanguageSwitcher language={language} onChange={setLanguage} />
          <AuthStatus labels={text} />
          <h1>{text.heroTitle}</h1>
          <p className="home-hero__text">{text.heroText}</p>
          <div className="home-hero__actions">
            {!isLoggedIn && (
              <Link className="home-hero__button" href="/login">
                {text.loginButton}
              </Link>
            )}
            {isLoggedIn && (
              <Link className="home-hero__button" href="/find-family">
                {text.findFamilyButton}
              </Link>
            )}
            <Link className="home-hero__button home-hero__button--light" href="/chat">
              {text.chatButton}
            </Link>
            <Link className="home-hero__button home-hero__button--light" href="/media-book">
              Make a book from text
            </Link>
          </div>
        </section>

        <HomeFamilyPreview isLoggedIn={isLoggedIn} message={message} requests={requests} text={text} />
      </div>
    </main>
  );
}
