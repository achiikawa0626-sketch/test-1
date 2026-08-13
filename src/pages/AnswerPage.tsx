import { Link, useRoute } from 'wouter';

export function AnswerPage() {
  const [, params] = useRoute('/answer/:memoryId');
  const memoryId = params?.memoryId ?? '';

  return (
    <main className="container">
      <section className="card">
        <h1>Answers moved to chat</h1>
        <p className="empty">
          The family now talks in one chat, so kids can ask and grandma or grandpa can answer with
          text, voice, or video.
        </p>
        <Link className="text-button" href={memoryId ? `/chat/${memoryId}` : '/memories'}>
          Open chat
        </Link>
      </section>
    </main>
  );
}
