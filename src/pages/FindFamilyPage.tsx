import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { readAccountMode } from '../lib/accountMode';
import {
  loadFamilyRequests,
  respondToFamilyRequest,
  searchFamilyProfiles,
  sendFamilyRequest,
} from '../lib/familyConnections';
import type { FamilyProfile, FamilyRequest } from '../lib/familyConnections';

export function FindFamilyPage() {
  const mode = readAccountMode();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FamilyProfile[]>([]);
  const [requests, setRequests] = useState<FamilyRequest[]>([]);
  const [message, setMessage] = useState('');

  async function refreshRequests() {
    setRequests(await loadFamilyRequests());
  }

  useEffect(() => {
    refreshRequests().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : 'Could not load family accounts.');
    });
  }, []);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');

    try {
      const foundProfiles = await searchFamilyProfiles(query);
      setResults(foundProfiles);
      if (foundProfiles.length === 0) {
        setMessage('No family account found yet. Ask them to create an account, then try again.');
      }
    } catch (error) {
      setResults([]);
      setMessage(error instanceof Error ? error.message : 'Could not search family.');
    }
  }

  async function requestFamily(profileId: string) {
    try {
      const result = await sendFamilyRequest(profileId);
      setMessage(result === 'accepted' ? 'Family request accepted.' : 'Family request sent.');
      await refreshRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send request.');
    }
  }

  async function respond(requestId: string, status: 'accepted' | 'declined') {
    try {
      await respondToFamilyRequest(requestId, status);
      await refreshRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update request.');
    }
  }

  const accepted = requests.filter((request) => request.status === 'accepted');
  const incoming = requests.filter(
    (request) => request.status === 'pending' && request.direction === 'incoming',
  );
  const outgoing = requests.filter(
    (request) => request.status === 'pending' && request.direction === 'outgoing',
  );
  return (
    <main className="wide-container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <h1>Find your family</h1>
        <p>Search by email, send a request, and connect before opening family chats.</p>
        <AuthStatus />
      </header>

      <section className="family-connect">
        <div className="card">
          <h2>Your role</h2>
          <p className="locked-role">
            {mode === 'kid' ? 'Child or parent' : 'Grandma or granddad'}
          </p>
          <Link className="text-button" href="/profile">Edit profile</Link>
          <form className="family-search" onSubmit={search}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={mode === 'kid' ? "Grandma's email" : "Kid or parent's email"}
            />
            <button type="submit">Find</button>
          </form>
          {message && <p className="message">{message}</p>}

          <div className="profile-results">
            <h3>Search results</h3>
            {results.length === 0 ? (
              <p className="empty">Search by email or username to find an account.</p>
            ) : (
              results.map((profile) => (
              <article className="profile-row" key={profile.id}>
                <div>
                  <h3>{profile.displayName}</h3>
                  <p>{profile.username ? `@${profile.username}` : profile.email}</p>
                </div>
                <button type="button" onClick={() => void requestFamily(profile.id)}>
                  Request
                </button>
              </article>
              ))
            )}
          </div>
        </div>

        <div className="family-panels">
          <RequestPanel
            title="Requests to accept"
            empty="No one is waiting yet."
            requests={incoming}
            onRespond={respond}
          />
          <RequestPanel
            title="Sent requests"
            empty="No sent requests yet."
            requests={outgoing}
            onRespond={respond}
          />
          <ConnectedPanel requests={accepted} />
        </div>
      </section>
    </main>
  );
}

type RequestPanelProps = {
  title: string;
  empty: string;
  requests: FamilyRequest[];
  onRespond: (requestId: string, status: 'accepted' | 'declined') => Promise<void>;
};

function RequestPanel({ title, empty, requests, onRespond }: RequestPanelProps) {
  return (
    <section className="card request-panel">
      <h2>{title}</h2>
      {requests.length === 0 ? (
        <p className="empty">{empty}</p>
      ) : (
        requests.map((request) => (
          <article className="profile-row" key={request.id}>
            <div>
              <h3>{request.profile.displayName}</h3>
              <p>{request.profile.email}</p>
            </div>
            {request.direction === 'incoming' && (
              <div className="request-actions">
                <button type="button" onClick={() => void onRespond(request.id, 'accepted')}>
                  Accept
                </button>
                <button
                  className="ghost"
                  type="button"
                  onClick={() => void onRespond(request.id, 'declined')}
                >
                  Decline
                </button>
              </div>
            )}
          </article>
        ))
      )}
    </section>
  );
}

function ConnectedPanel({ requests }: { requests: FamilyRequest[] }) {
  return (
    <section className="card request-panel">
      <h2>Your family</h2>
      {requests.length === 0 ? (
        <p className="empty">Connect with family first, then start asking questions.</p>
      ) : (
        <>
          {requests.map((request) => (
            <article className="profile-row" key={request.id}>
              <div>
                <h3>{request.profile.displayName}</h3>
                <p>{request.profile.email}</p>
              </div>
            </article>
          ))}
          <Link className="text-button" href="/questions">Start questions</Link>
        </>
      )}
    </section>
  );
}
