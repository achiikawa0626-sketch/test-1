import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';

export function HomePage() {
  return (
    <main className="home-page">
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
    </main>
  );
}
