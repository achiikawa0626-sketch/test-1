import { Link } from 'wouter';
import type { FamilyProfile, FamilyRequest } from '../lib/familyConnections';
import type { AccountMode } from '../lib/accountMode';

type FamilySearchCardProps = {
  mode: AccountMode;
  query: string;
  results: FamilyProfile[];
  requests: FamilyRequest[];
  message: string;
  sendingId: string;
  onQueryChange: (query: string) => void;
  onSearch: (event: React.FormEvent) => void;
  onRequest: (profileId: string) => void;
};

export function FamilySearchCard({
  mode,
  query,
  results,
  requests,
  message,
  sendingId,
  onQueryChange,
  onSearch,
  onRequest,
}: FamilySearchCardProps) {
  return (
    <section className="card family-search-card">
      <div>
        <h2>Your role</h2>
        <p className="locked-role">{mode === 'kid' ? 'Child or parent' : 'Grandma or granddad'}</p>
        <Link className="text-button" href="/profile">Edit profile</Link>
      </div>

      <form className="family-search" onSubmit={onSearch}>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={mode === 'kid' ? "Grandma's email or username" : "Family email or username"}
        />
        <button type="submit">Find</button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="profile-results">
        <h3>People you found</h3>
        {results.length === 0 ? (
          <p className="empty">Search for the email or username they used when signing up.</p>
        ) : (
          results.map((profile) => (
            <SearchResult
              key={profile.id}
              profile={profile}
              request={requests.find((item) => item.profile.id === profile.id)}
              sendingId={sendingId}
              onRequest={onRequest}
            />
          ))
        )}
      </div>
    </section>
  );
}

type SearchResultProps = {
  profile: FamilyProfile;
  request?: FamilyRequest;
  sendingId: string;
  onRequest: (profileId: string) => void;
};

function SearchResult({ profile, request, sendingId, onRequest }: SearchResultProps) {
  const isBusy = sendingId === profile.id;
  const label = request ? requestLabel(request) : isBusy ? 'Sending...' : 'Send request';

  return (
    <article className="profile-row">
      <div>
        <h3>{profile.displayName}</h3>
        <p>{profile.username ? `@${profile.username}` : profile.email}</p>
      </div>
      <button
        type="button"
        disabled={Boolean(request) || isBusy}
        onClick={() => onRequest(profile.id)}
      >
        {label}
      </button>
    </article>
  );
}

function requestLabel(request: FamilyRequest) {
  if (request.status === 'accepted') return 'Connected';
  if (request.direction === 'incoming') return 'Waiting for you';
  if (request.status === 'declined') return 'Declined';
  return 'Request sent';
}
