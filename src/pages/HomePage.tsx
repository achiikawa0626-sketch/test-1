import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { HomeFamilyPreview } from '../components/HomeFamilyPreview';
import { loadFamilyRequests } from '../lib/familyConnections';
import type { FamilyRequest } from '../lib/familyConnections';
import { supabase } from '../lib/supabase';

export function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [message, setMessage] = useState('');

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
          <AuthStatus />
          <h1>Save your family stories before they disappear.</h1>
          <p className="home-hero__text">
            Log in, set up your profile once, connect your family, and keep questions and answers in
            one private chat.
          </p>
          <div className="home-hero__actions">
            <Link className="home-hero__button" href="/login">
              Log in or create account
            </Link>
            <Link className="home-hero__button home-hero__button--light" href="/chat">
              Open chat
            </Link>
          </div>
        </section>

        <HomeFamilyPreview isLoggedIn={isLoggedIn} message={message} requests={requests} />
      </div>
    </main>
  );
}
