import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { readAccountMode } from '../lib/accountMode';

export function QuestionsPage() {
  const isGrandparent = readAccountMode() === 'grandparent';

  return (
    <main className="wide-container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <h1>{isGrandparent ? 'Open your family chat' : 'Questions moved to chat'}</h1>
        <p>
          {isGrandparent
            ? 'Grandma and grandpa answer questions inside chat.'
            : 'Tap the plus button inside chat to pick or write a family question.'}
        </p>
        <AuthStatus />
      </header>

      <section className="card">
        <p className="empty">
          {isGrandparent
            ? 'Your questions will appear in the family chat.'
            : 'Questions now live inside the family chat.'}
        </p>
        <Link className="text-button" href="/chat">Open chat</Link>
      </section>
    </main>
  );
}
