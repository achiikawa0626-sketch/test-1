import { Link } from 'wouter';
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
              <div>
                <h3>{request.profile.displayName}</h3>
                <p>{request.profile.username ? `@${request.profile.username}` : request.profile.email}</p>
              </div>
              <span className="request-chip request-chip--connected">Connected</span>
            </article>
          ))}
          <div className="family-next-actions">
            <Link className="text-button" href="/questions">Ask questions</Link>
            <Link className="text-button" href="/chat">Open chat</Link>
          </div>
        </>
      )}
    </section>
  );
}
