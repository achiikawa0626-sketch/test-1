import type { FamilyProfile } from '../lib/familyConnections';

type ChatContactHeaderProps = {
  contact?: FamilyProfile;
};

export function ChatContactHeader({ contact }: ChatContactHeaderProps) {
  const title = contact?.displayName ?? 'Family chat';
  const subtitle = contact?.username ? `@${contact.username}` : 'private chat';

  return (
    <>
      <div className="chat-avatar chat-avatar--static">
        <span>{title.charAt(0).toUpperCase()}</span>
      </div>
      <div className="chat-title">
        <strong>{title}</strong>
        <p>{subtitle}</p>
      </div>
    </>
  );
}
