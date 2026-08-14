import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';

export function HomePage() {
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

        <AskEveryGenerationCard />
      </div>
    </main>
  );
}

function AskEveryGenerationCard() {
  return (
    <section className="generation-card" aria-label="Ask every generation">
      <div className="generation-card__question">
        <span>Question</span>
        <h2>What does success mean to you?</h2>
      </div>

      <div className="generation-card__answers">
        <article className="generation-answer">
          <div className="generation-answer__avatar">+</div>
          <div className="generation-answer__body">
            <h3>Connect real family accounts</h3>
            <p>
              Search for grandma, parents, or kids by their account email, send a request, and their
              answers will appear together here.
            </p>
            <Link className="generation-connect-link" href="/find-family">
              Find family
            </Link>
          </div>
        </article>
        <article className="generation-answer generation-answer--empty">
          <div className="generation-answer__avatar">?</div>
          <div className="generation-answer__body">
            <h3>No made-up people</h3>
            <p>
              This comparison card will use connected profiles only, so every story belongs to a
              real person in your family.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
