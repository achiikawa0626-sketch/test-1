import { Link } from 'wouter';
import { AuthStatus } from './AuthStatus';
import { FamilyChatProfileEditor } from './FamilyChatProfileEditor';
import { StreakBadge } from './StreakBadge';
import type { ChatStreak } from '../lib/chatStreak';
import type { FamilyChatProfile } from '../lib/familyChatProfile';

type ChatHeaderProps = {
  familyProfile: FamilyChatProfile;
  streak: ChatStreak;
  onProfileChange: (profile: FamilyChatProfile) => void;
  onMessage: (message: string) => void;
};

export function ChatHeader({
  familyProfile,
  streak,
  onProfileChange,
  onMessage,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <Link className="chat-back" href="/find-family">Back</Link>
      <FamilyChatProfileEditor
        profile={familyProfile}
        onChange={onProfileChange}
        onMessage={onMessage}
      />
      <StreakBadge streak={streak} />
      <AuthStatus compact />
    </header>
  );
}
