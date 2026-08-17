import { Link } from 'wouter';
import type { FamilyRequest } from '../lib/familyConnections';

type HomeFamilyPreviewProps = {
  isLoggedIn: boolean;
  message: string;
  requests: FamilyRequest[];
};

export function HomeFamilyPreview({
  isLoggedIn,
  message,
  requests,
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
        <CardHeader label="Start" title="Your family stories live here." />
        <div className="generation-card__answers">
          <ActionRow
            icon="+"
            title="Create your account"
            text="Log in first, then connect with real family accounts and start a private chat."
            href="/login"
            label="Log in"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="generation-card" aria-label="Family preview">
      <CardHeader
        label="Your Family"
        title={accepted.length > 0 ? 'People you can chat with now.' : 'Build your family circle.'}
      />
      <div className="generation-card__answers">
        {message && <p className="generation-message">{message}</p>}
        {accepted.map((request) => (
          <FamilyRow request={request} key={request.id} />
        ))}
        {incoming.length > 0 && (
          <ActionRow
            icon="!"
            title={`${incoming.length} request${incoming.length === 1 ? '' : 's'} waiting`}
            text="Someone wants to connect with you. Review the request and accept it to start chatting."
            href="/find-family"
            label="Review"
          />
        )}
        {outgoing.length > 0 && accepted.length === 0 && (
          <ActionRow
            icon="..."
            title="Waiting for family"
            text="Your request was sent. Once they accept, their profile will show up here."
            href="/find-family"
            label="Check status"
          />
        )}
        {accepted.length === 0 && incoming.length === 0 && outgoing.length === 0 && (
          <ActionRow
            icon="+"
            title="Add your first family member"
            text="Search by email, send a request, and this card becomes your real family hub."
            href="/find-family"
            label="Find family"
          />
        )}
        {accepted.length > 0 && (
          <ActionRow
            icon=">"
            title="Open your family chat"
            text="Send messages, voice notes, videos, and questions with the people connected above."
            href="/chat"
            label="Open chat"
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

function FamilyRow({ request }: { request: FamilyRequest }) {
  const name = request.profile.displayName;
  const role = request.profile.accountMode === 'kid' ? 'Child or parent' : 'Grandparent';

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
