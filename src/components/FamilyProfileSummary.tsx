import type { FamilyProfile } from '../lib/familyConnections';

type FamilyProfileSummaryProps = {
  profile: FamilyProfile;
};

export function FamilyProfileSummary({ profile }: FamilyProfileSummaryProps) {
  return (
    <div className="profile-person">
      <div className="profile-avatar-small">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" />
        ) : (
          <span>{profile.displayName[0]?.toUpperCase() ?? '?'}</span>
        )}
      </div>
      <div>
        <h3>{profile.displayName}</h3>
        <p>{profile.username ? `@${profile.username}` : profile.email}</p>
      </div>
    </div>
  );
}
