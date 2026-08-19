import { FamilyProfileSummary } from './FamilyProfileSummary';
import type { FamilyRequest } from '../lib/familyConnections';
import type { HomeTranslation } from '../lib/homeTranslations';

type FamilyRequestPanelProps = {
  title: string;
  empty: string;
  requests: FamilyRequest[];
  busyId: string;
  text: HomeTranslation;
  onRespond: (requestId: string, status: 'accepted' | 'declined') => void;
  onCancel: (requestId: string) => void;
};

export function FamilyRequestPanel({
  title,
  empty,
  requests,
  busyId,
  text,
  onRespond,
  onCancel,
}: FamilyRequestPanelProps) {
  return (
    <section className="card request-panel">
      <h2>{title}</h2>
      {requests.length === 0 ? (
        <p className="empty">{empty}</p>
      ) : (
        requests.map((request) => (
          <article className="profile-row" key={request.id}>
            <FamilyProfileSummary profile={request.profile} />
            <RequestActions
              request={request}
              isBusy={busyId === request.id}
              text={text}
              onRespond={onRespond}
              onCancel={onCancel}
            />
          </article>
        ))
      )}
    </section>
  );
}

type RequestActionsProps = {
  request: FamilyRequest;
  isBusy: boolean;
  text: HomeTranslation;
  onRespond: (requestId: string, status: 'accepted' | 'declined') => void;
  onCancel: (requestId: string) => void;
};

function RequestActions({ request, isBusy, text, onRespond, onCancel }: RequestActionsProps) {
  if (request.direction === 'incoming') {
    return (
      <div className="request-actions">
        <button type="button" disabled={isBusy} onClick={() => onRespond(request.id, 'accepted')}>
          {text.acceptButton}
        </button>
        <button
          className="ghost"
          type="button"
          disabled={isBusy}
          onClick={() => onRespond(request.id, 'declined')}
        >
          {text.declineButton}
        </button>
      </div>
    );
  }

  return (
    <div className="request-actions">
      <span className="request-chip">{text.waitingChip}</span>
      <button className="ghost" type="button" disabled={isBusy} onClick={() => onCancel(request.id)}>
        {text.cancelButton}
      </button>
    </div>
  );
}
