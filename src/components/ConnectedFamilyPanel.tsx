import { Link } from 'wouter';
import { FamilyProfileSummary } from './FamilyProfileSummary';
import type { FamilyRequest } from '../lib/familyConnections';

type ConnectedFamilyPanelProps = {
  requests: FamilyRequest[];
};

export function ConnectedFamilyPanel({ requests }: ConnectedFamilyPanelProps) {
  return (
    <section className="card request-panel">
      <h2>Your family</h2>
      {requests.length === 0 ? (
        <p className="empty">Accepted requests will appear here.</p>
      ) : (
        <>
          {requests.map((request) => (
            <article className="profile-row" key={request.id}>
              <FamilyProfileSummary profile={request.profile} />
              <Link className="text-button" href={`/chat?contact=${request.profile.id}`}>
                Chat
              </Link>
            </article>
          ))}
          <div className="family-next-actions">
            <Link className="text-button" href="/questions">Ask questions</Link>
          </div>
        </>
      )}
    </section>
  );
}
