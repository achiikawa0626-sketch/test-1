import type { ChatStreak } from '../lib/chatStreak';

type StreakBadgeProps = {
  streak: ChatStreak;
};

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="streak-badge" title={`Best streak: ${streak.bestStreak} days`}>
      <span className="streak-flame" aria-hidden="true" />
      <strong>{streak.currentStreak}</strong>
      <span>day streak</span>
    </div>
  );
}
