import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { FamilyProfileSummary } from '../components/FamilyProfileSummary';
import { loadChatContacts } from '../lib/directChat';
import type { FamilyProfile } from '../lib/familyConnections';

export function AskPage() {
  const [contacts, setContacts] = useState<FamilyProfile[]>([]);
  const [message, setMessage] = useState('');
  const question = readQuestion();

  useEffect(() => {
    loadChatContacts()
      .then(setContacts)
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load connected family.');
      });
  }, []);

  return (
    <main className="container">
      <header className="page-header">
        <Link href="/questions">Questions</Link>
        <h1>Choose family</h1>
        <p>Send this question into a real chat with someone connected.</p>
        <AuthStatus />
      </header>

      <section className="card request-panel">
        <p className="question-preview">{question}</p>
        {message && <p className="message">{message}</p>}
        {contacts.length === 0 ? (
          <>
            <p className="empty">Connect with family first, then you can ask them here.</p>
            <Link className="text-button" href="/find-family">Find family</Link>
          </>
        ) : (
          contacts.map((contact) => (
            <article className="profile-row" key={contact.id}>
              <FamilyProfileSummary profile={contact} />
              <Link className="text-button" href={chatHref(contact.id, question)}>
                Chat
              </Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

function readQuestion() {
  const params = new URLSearchParams(window.location.search);
  return params.get('question') ?? 'Choose a question for your family chat.';
}

function chatHref(contactId: string, question: string) {
  const params = new URLSearchParams({ contact: contactId, question });
  return `/chat?${params.toString()}`;
}
