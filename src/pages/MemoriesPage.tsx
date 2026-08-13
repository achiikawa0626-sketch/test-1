import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { memoryTopics } from '../lib/askGrandma';

export function MemoriesPage() {
  return (
    <main className="container">
      <header className="page-header">
        <Link href="/questions">Questions</Link>
        <h1>Family story</h1>
        <p>Saved memories are grouped by topic so your family story starts to take shape.</p>
        <AuthStatus />
      </header>

      <section className="story-groups">
        {memoryTopics.map((topic) => (
          <section className="story-group" key={topic}>
            <h2>{topic}</h2>
            <p className="empty">No memories here yet.</p>
          </section>
        ))}
      </section>
    </main>
  );
}
