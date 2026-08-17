import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { FamilyProfileSummary } from '../components/FamilyProfileSummary';
import { QuestionPicker } from '../components/QuestionPicker';
import { readAccountMode } from '../lib/accountMode';
import { loadChatContacts } from '../lib/directChat';
import type { FamilyProfile } from '../lib/familyConnections';
import { generateFollowUpQuestion } from '../lib/followUpQuestion';

const starterQuestions = [
  'What was your favorite day when you were my age?',
  'What is one family story you never want us to forget?',
  'What was home like when you were growing up?',
];

export function QuestionsPage() {
  const mode = readAccountMode();
  const [contacts, setContacts] = useState<FamilyProfile[]>([]);
  const [question, setQuestion] = useState(starterQuestions[0]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [isGeneratingAiQuestion, setIsGeneratingAiQuestion] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadChatContacts()
      .then((nextContacts) => {
        setContacts(nextContacts);
        void loadAiQuestion(nextContacts);
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load connected family.');
      });
  }, []);

  async function loadAiQuestion(nextContacts: FamilyProfile[]) {
    if (nextContacts.length === 0) return;
    setIsGeneratingAiQuestion(true);

    try {
      const nextQuestion = await generateFollowUpQuestion(nextContacts);
      setAiQuestion(nextQuestion);
    } finally {
      setIsGeneratingAiQuestion(false);
    }
  }

  if (mode === 'grandparent') {
    return (
      <main className="wide-container">
        <header className="page-header">
          <Link href="/">AskGrandma</Link>
          <h1>Answer in chat</h1>
          <p>Grandparents receive questions from family and answer them in the private chat.</p>
          <AuthStatus />
        </header>

        <section className="card request-panel">
          <h2>Your role is Grandma or granddad</h2>
          <p className="empty">Wait for your family to ask a question, or open chat to reply.</p>
          <Link className="text-button" href="/chat">Open chat</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="wide-container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <h1>Ask in chat</h1>
        <p>Pick a question, choose your connected family member, and start talking.</p>
        <AuthStatus />
      </header>

      <section className="question-chat-grid">
        <QuestionPicker
          aiQuestion={aiQuestion}
          isGeneratingAiQuestion={isGeneratingAiQuestion}
          question={question}
          starterQuestions={starterQuestions}
          onChange={setQuestion}
        />
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

function chatHref(contactId: string, question: string) {
  const params = new URLSearchParams({
    contact: contactId,
    question: question.trim(),
  });
  return `/chat?${params.toString()}`;
}
