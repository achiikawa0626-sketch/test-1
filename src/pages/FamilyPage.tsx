import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';

export function FamilyPage() {
  return (
    <main className="container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <h1>Find your family</h1>
        <p>
          Family is now created by sending a request. Search for grandma, grandpa, kid, or parent
          by email and connect before chatting.
        </p>
        <AuthStatus />
      </header>

      <section className="card">
        <h2>No old family setup needed</h2>
        <p className="empty">
          The old page used a table called family_members. The new flow uses family requests, so
          this page now sends you to the correct place.
        </p>
        <Link className="text-button" href="/find-family">Open family requests</Link>
      </section>
    </main>
  );
}
