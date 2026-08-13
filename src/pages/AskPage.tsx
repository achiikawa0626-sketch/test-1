import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';

export function AskPage() {
  const params = new URLSearchParams(window.location.search);
  const question = params.get('question') ?? 'Choose a question for your family chat.';

  return (
    <main className="container">
      <header className="page-header">
        <Link href="/questions">Questions</Link>
        <h1>Connect family first</h1>
        <p>Before sending this question, connect with grandma, grandpa, kid, or parent.</p>
        <AuthStatus />
      </header>

      <section className="card">
        <p className="question-preview">{question}</p>
        <p className="empty">
          The new product flow is login, find family, then chat. After the request is accepted,
          questions will open inside the real messenger chat.
        </p>
        <Link className="text-button" href="/find-family">Find family</Link>
      </section>
    </main>
  );
}
