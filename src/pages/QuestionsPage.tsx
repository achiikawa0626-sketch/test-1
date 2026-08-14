import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { FamilyProfileSummary } from '../components/FamilyProfileSummary';
import { loadChatContacts } from '../lib/directChat';
import type { FamilyProfile } from '../lib/familyConnections';

const starterQuestions = [
  'What was your favorite day when you were my age?',
  'What is one family story you never want us to forget?',
  'What was home like when you were growing up?',
];

export function QuestionsPage() {
  const [contacts, setContacts] = useState<FamilyProfile[]>([]);
  const [question, setQuestion] = useState(starterQuestions[0]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadChatContacts()
      .then(setContacts)
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load connected family.');
      });
  }, []);

  return (
    <main className="wide-container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <h1>Ask in chat</h1>
        <p>Pick a question, choose your connected family member, and start talking.</p>
        <AuthStatus />
      </header>

      <section className="question-chat-grid">
        <QuestionPicker question={question} onChange={setQuestion} />
        <section className="card request-panel">
          <h2>Choose who to ask</h2>
          {message && <p className="message">{message}</p>}
          {contacts.length === 0 ? (
            <p className="empty">Connect with family first, then their chat appears here.</p>
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
      </section>
    </main>
  );
}

type QuestionPickerProps = {
  question: string;
  onChange: (question: string) => void;
};

function QuestionPicker({ question, onChange }: QuestionPickerProps) {
  return (
    <section className="card question-picker">
      <h2>Your question</h2>
      <textarea value={question} onChange={(event) => onChange(event.target.value)} />
      <div className="journey-card__questions">
        {starterQuestions.map((item) => (
          <button className="ghost question-choice" type="button" key={item} onClick={() => onChange(item)}>
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

function chatHref(contactId: string, question: string) {
  const params = new URLSearchParams({
    contact: contactId,
    question: question.trim(),
  });
  return `/chat?${params.toString()}`;
}
