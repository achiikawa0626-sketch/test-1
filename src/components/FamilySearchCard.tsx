import { Link } from 'wouter';
import { FamilyProfileSummary } from './FamilyProfileSummary';
import type { FamilyProfile, FamilyRequest } from '../lib/familyConnections';
import type { AccountMode } from '../lib/accountMode';
import type { HomeTranslation } from '../lib/homeTranslations';

type FamilySearchCardProps = {
  mode: AccountMode;
  query: string;
  results: FamilyProfile[];
  requests: FamilyRequest[];
  message: string;
  sendingId: string;
  text: HomeTranslation;
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
  text,
  onQueryChange,
  onSearch,
  onRequest,
}: FamilySearchCardProps) {
  return (
    <section className="card family-search-card">
      <div>
        <h2>{text.yourRoleTitle}</h2>
        <p className="locked-role">
          {mode === 'kid' ? text.authKidParent : text.authGrandparent}
        </p>
        <Link className="text-button" href="/profile">{text.editProfileLink}</Link>
      </div>

      <form className="family-search" onSubmit={onSearch}>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={
            mode === 'kid' ? text.grandmaSearchPlaceholder : text.familySearchPlaceholder
          }
        />
        <button type="submit">{text.findButton}</button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="profile-results">
        <h3>{text.peopleFoundTitle}</h3>
        {results.length === 0 ? (
          <p className="empty">{text.searchHint}</p>
        ) : (
          results.map((profile) => (
            <SearchResult
              key={profile.id}
              profile={profile}
              request={requests.find((item) => item.profile.id === profile.id)}
              sendingId={sendingId}
              text={text}
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
  text: HomeTranslation;
  onRequest: (profileId: string) => void;
};

function SearchResult({ profile, request, sendingId, text, onRequest }: SearchResultProps) {
  const isBusy = sendingId === profile.id;
  const label = request ? requestLabel(request, text) : isBusy ? text.sendingRequest : text.sendRequestButton;

  return (
    <article className="profile-row">
      <FamilyProfileSummary profile={profile} />
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

function requestLabel(request: FamilyRequest, text: HomeTranslation) {
  if (request.status === 'accepted') return text.connectedLabel;
  if (request.direction === 'incoming') return text.waitingForYouLabel;
  if (request.status === 'declined') return text.declinedLabel;
  return text.requestSentLabel;
}
