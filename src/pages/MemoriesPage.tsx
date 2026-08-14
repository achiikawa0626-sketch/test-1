import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { loadMemories } from '../lib/askGrandma';
import type { Memory, MemoryTopic } from '../lib/askGrandma';

type VaultTab = 'Childhood' | 'Love & Family' | 'Life Lessons' | 'Traditions';

const vaultTabs: VaultTab[] = ['Childhood', 'Love & Family', 'Life Lessons', 'Traditions'];

const topicToTab: Partial<Record<MemoryTopic, VaultTab>> = {
  Childhood: 'Childhood',
  'Love and Family': 'Love & Family',
  'Hard Choices': 'Life Lessons',
  'Advice for Me': 'Life Lessons',
  Traditions: 'Traditions',
};

export function MemoriesPage() {
  const [activeTab, setActiveTab] = useState<VaultTab>('Childhood');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadMemories()
      .then(setMemories)
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load memories.');
      });
  }, []);

  const activeMemories = memories.filter((memory) => topicToTab[memory.topic] === activeTab);

  return (
    <main className="wide-container memory-vault">
      <header className="page-header vault-header">
        <Link href="/questions">Questions</Link>
        <h1>Grandparent Memory Vault</h1>
        <p>Recorded answers become a calm timeline your family can listen to, read, and search.</p>
        <AuthStatus />
      </header>

      <section className="vault-record-panel">
        <div>
          <span className="record-pulse" aria-hidden="true" />
          <h2>Ready for one story at a time</h2>
          <p>Grandma sees one clear action, large buttons, and obvious recording feedback.</p>
        </div>
        <Link className="vault-record-button" href="/questions">
          Record
        </Link>
      </section>

      <nav className="vault-tabs" aria-label="Memory categories">
        {vaultTabs.map((tab) => (
          <button
            className={tab === activeTab ? 'active' : ''}
            type="button"
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </button>
        ))}
      </nav>

      {message && <p className="message">{message}</p>}

      <section className="vault-timeline" aria-label={`${activeTab} memories`}>
        {activeMemories.length === 0 ? (
          <div className="vault-empty">
            <h2>No {activeTab.toLowerCase()} memories yet.</h2>
            <p>Ask a question, record an answer, and the transcript will appear here.</p>
          </div>
        ) : (
          activeMemories.map((memory) => <TimelineMemory memory={memory} key={memory.id} />)
        )}
      </section>
    </main>
  );
}

function TimelineMemory({ memory }: { memory: Memory }) {
  const savedDate = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(memory.createdAt));

  return (
    <article className="timeline-memory">
      <div className="timeline-marker">
        <span />
        <strong>{savedDate}</strong>
      </div>
      <div className="memory-audio-card">
        <p className="topic-pill">{memory.topic}</p>
        <h2>{memory.question}</h2>
        <div className="memory-player">
          <button type="button" aria-label="Play memory audio">
            Play
          </button>
          <div className="memory-wave" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <p>Audio answer</p>
        </div>
        <section className="transcript-box">
          <h3>Auto transcript</h3>
          <p>{memory.answer || 'Transcript will appear after Grandma records her answer.'}</p>
        </section>
      </div>
    </article>
  );
}
