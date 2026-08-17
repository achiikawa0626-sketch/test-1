import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { ConnectedFamilyPanel } from '../components/ConnectedFamilyPanel';
import { FamilyRequestPanel } from '../components/FamilyRequestPanel';
import { FamilySearchCard } from '../components/FamilySearchCard';
import { readAccountMode } from '../lib/accountMode';
import {
  cancelFamilyRequest,
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
  const [isLoadingFamily, setIsLoadingFamily] = useState(true);
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');
  const incoming = requests.filter(isIncomingPending);
  const outgoing = requests.filter(isOutgoingPending);
  const accepted = requests.filter((request) => request.status === 'accepted');

  async function refreshRequests() {
    setIsLoadingFamily(true);
    try {
      setRequests(await loadFamilyRequests());
    } finally {
      setIsLoadingFamily(false);
    }
  }

  useEffect(() => {
    refreshRequests().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : 'Could not load family requests.');
    });
  }, []);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');

    try {
      const foundProfiles = await searchFamilyProfiles(query);
      setResults(foundProfiles);
      if (foundProfiles.length === 0) {
        setMessage('No account found. Check the email or username and try again.');
      }
    } catch (error) {
      setResults([]);
      setMessage(error instanceof Error ? error.message : 'Could not search family.');
    }
  }

  async function requestFamily(profileId: string) {
    setBusyId(profileId);
    setMessage('');

    try {
      const result = await sendFamilyRequest(profileId);
      setMessage(result === 'accepted' ? 'Family request accepted.' : 'Family request sent.');
      await refreshRequests();
      if (result === 'sent') {
        setMessage('Request sent. It will appear under Sent requests until they accept.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send request.');
    } finally {
      setBusyId('');
    }
  }

  async function respond(requestId: string, status: 'accepted' | 'declined') {
    setBusyId(requestId);
    setMessage('');

    try {
      await respondToFamilyRequest(requestId, status);
      await refreshRequests();
      setMessage(status === 'accepted' ? 'Family request accepted.' : 'Family request declined.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update request.');
    } finally {
      setBusyId('');
    }
  }

  async function cancel(requestId: string) {
    setBusyId(requestId);
    setMessage('');

    try {
      await cancelFamilyRequest(requestId);
      await refreshRequests();
      setMessage('Request canceled.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not cancel request.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <main className="wide-container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <h1>Family requests</h1>
        <p>Find someone by email or username, send a request, and connect after they accept.</p>
        <AuthStatus />
      </header>

      <section className="family-connect">
        <FamilySearchCard
          mode={mode}
          query={query}
          results={results}
          requests={requests}
          message={message}
          sendingId={busyId}
          onQueryChange={setQuery}
          onSearch={search}
          onRequest={(profileId) => void requestFamily(profileId)}
        />

        <div className="family-panels">
          <FamilyRequestPanel
            title="Requests to accept"
            empty={isLoadingFamily ? 'Loading requests...' : 'When someone asks to connect, you can accept or decline here.'}
            requests={incoming}
            busyId={busyId}
            onRespond={(requestId, status) => void respond(requestId, status)}
            onCancel={(requestId) => void cancel(requestId)}
          />
          <FamilyRequestPanel
            title="Sent requests"
            empty={isLoadingFamily ? 'Loading sent requests...' : 'Requests you send will stay here until the other person answers.'}
            requests={outgoing}
            busyId={busyId}
            onRespond={(requestId, status) => void respond(requestId, status)}
            onCancel={(requestId) => void cancel(requestId)}
          />
          <ConnectedFamilyPanel
            mode={mode}
            requests={accepted}
          />
        </div>
      </section>
    </main>
  );
}

function isIncomingPending(request: FamilyRequest) {
  return request.status === 'pending' && request.direction === 'incoming';
}

function isOutgoingPending(request: FamilyRequest) {
  return request.status === 'pending' && request.direction === 'outgoing';
}
