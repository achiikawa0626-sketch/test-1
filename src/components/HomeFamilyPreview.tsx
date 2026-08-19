import { Link } from 'wouter';
import type { FamilyRequest } from '../lib/familyConnections';
import type { HomeTranslation } from '../lib/homeTranslations';

type HomeFamilyPreviewProps = {
  isLoggedIn: boolean;
  message: string;
  requests: FamilyRequest[];
  text: HomeTranslation;
};

export function HomeFamilyPreview({
  isLoggedIn,
  message,
  requests,
  text,
}: HomeFamilyPreviewProps) {
  const accepted = requests.filter((request) => request.status === 'accepted');
  const incoming = requests.filter(
    (request) => request.status === 'pending' && request.direction === 'incoming',
  );
  const outgoing = requests.filter(
    (request) => request.status === 'pending' && request.direction === 'outgoing',
  );

  if (!isLoggedIn) {
    return (
      <section className="generation-card" aria-label="Family preview">
        <CardHeader label={text.startLabel} title={text.signedOutTitle} />
        <div className="generation-card__answers">
          <ActionRow
            icon="+"
            title={text.loginButton}
            text={text.signedOutText}
            href="/login"
            label={text.signedOutButton}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="generation-card" aria-label="Family preview">
      <CardHeader
        label={text.familyPreviewLabel}
        title={accepted.length > 0 ? text.familyReadyTitle : text.familyEmptyTitle}
      />
      <div className="generation-card__answers">
        {message && <p className="generation-message">{message}</p>}
        {accepted.map((request) => (
          <FamilyRow labels={text} request={request} key={request.id} />
        ))}
        {incoming.length > 0 && (
          <ActionRow
            icon="!"
            title={
              incoming.length === 1
                ? text.incomingRequestSingle
                : text.incomingRequestMany(incoming.length)
            }
            text={text.incomingRequestText}
            href="/find-family"
            label={text.reviewButton}
          />
        )}
        {outgoing.length > 0 && accepted.length === 0 && (
          <ActionRow
            icon="..."
            title={text.waitingTitle}
            text={text.waitingText}
            href="/find-family"
            label={text.checkStatusButton}
          />
        )}
        {accepted.length === 0 && incoming.length === 0 && outgoing.length === 0 && (
          <ActionRow
            icon="+"
            title={text.addFamilyTitle}
            text={text.addFamilyText}
            href="/find-family"
            label={text.findFamilyButton}
          />
        )}
        {accepted.length > 0 && (
          <ActionRow
            icon=">"
            title={text.openFamilyChatTitle}
            text={text.openFamilyChatText}
            href="/chat"
            label={text.chatButton}
          />
        )}
      </div>
    </section>
  );
}

function CardHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="generation-card__question">
      <span>{label}</span>
      <h2>{title}</h2>
    </div>
  );
}

function FamilyRow({ labels, request }: { labels: HomeTranslation; request: FamilyRequest }) {
  const name = request.profile.displayName;
  const role =
    request.profile.accountMode === 'kid' ? labels.authKidParent : labels.authGrandparent;

  return (
    <article className="generation-answer">
      <div className="generation-answer__avatar">{name.charAt(0).toUpperCase()}</div>
      <div className="generation-answer__body">
        <h3>
          {name} <span>{role}</span>
        </h3>
        <p>{request.profile.username ? `@${request.profile.username}` : request.profile.email}</p>
      </div>
    </article>
  );
}

function ActionRow({
  icon,
  title,
  text,
  href,
  label,
}: {
  icon: string;
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <article className="generation-answer generation-answer--empty">
      <div className="generation-answer__avatar">{icon}</div>
      <div className="generation-answer__body">
        <h3>{title}</h3>
        <p>{text}</p>
        <Link className="generation-connect-link" href={href}>
          {label}
        </Link>
      </div>
    </article>
  );
}
