import { Link } from 'wouter';
import { FamilyProfileSummary } from './FamilyProfileSummary';
import type { AccountMode } from '../lib/accountMode';
import type { FamilyRequest } from '../lib/familyConnections';
import type { HomeTranslation } from '../lib/homeTranslations';

type ConnectedFamilyPanelProps = {
  mode: AccountMode;
  requests: FamilyRequest[];
  text: HomeTranslation;
};

export function ConnectedFamilyPanel({ mode, requests, text }: ConnectedFamilyPanelProps) {
  return (
    <section className="card request-panel">
      <h2>{text.yourFamilyTitle}</h2>
      {requests.length === 0 ? (
        <p className="empty">{text.acceptedRequestsEmpty}</p>
      ) : (
        <>
          {requests.map((request) => (
            <article className="profile-row" key={request.id}>
              <FamilyProfileSummary profile={request.profile} />
              <Link className="text-button" href={`/chat?contact=${request.profile.id}`}>
                {text.familyChatButton}
              </Link>
            </article>
          ))}
          {mode === 'kid' && (
            <div className="family-next-actions">
              <Link className="text-button" href="/questions">{text.askQuestionsButton}</Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
