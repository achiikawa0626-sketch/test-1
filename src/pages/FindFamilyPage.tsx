import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { AuthStatus } from '../components/AuthStatus';
import { ConnectedFamilyPanel } from '../components/ConnectedFamilyPanel';
import { FamilyRequestPanel } from '../components/FamilyRequestPanel';
import { FamilySearchCard } from '../components/FamilySearchCard';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { readAccountMode } from '../lib/accountMode';
import { useAppLanguage } from '../lib/appLanguage';
import {
  cancelFamilyRequest,
  loadFamilyRequests,
  respondToFamilyRequest,
  searchFamilyProfiles,
  sendFamilyRequest,
} from '../lib/familyConnections';
import type { FamilyProfile, FamilyRequest } from '../lib/familyConnections';
import { homeTranslations } from '../lib/homeTranslations';

export function FindFamilyPage() {
  const mode = readAccountMode();
  const [language, setLanguage] = useAppLanguage();
  const text = homeTranslations[language];
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
      setMessage(error instanceof Error ? error.message : text.couldNotLoadRequests);
    });
  }, [text.couldNotLoadRequests]);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');

    try {
      const foundProfiles = await searchFamilyProfiles(query);
      setResults(foundProfiles);
      if (foundProfiles.length === 0) {
        setMessage(text.noAccountFound);
      }
    } catch (error) {
      setResults([]);
      setMessage(error instanceof Error ? error.message : text.couldNotSearchFamily);
    }
  }

  async function requestFamily(profileId: string) {
    setBusyId(profileId);
    setMessage('');

    try {
      const result = await sendFamilyRequest(profileId);
      setMessage(result === 'accepted' ? text.familyRequestAccepted : text.familyRequestSent);
      await refreshRequests();
      if (result === 'sent') {
        setMessage(text.requestSentDetails);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.couldNotSendRequest);
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
      setMessage(
        status === 'accepted' ? text.familyRequestAccepted : text.familyRequestDeclined,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.couldNotUpdateRequest);
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
      setMessage(text.requestCanceled);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.couldNotCancelRequest);
    } finally {
      setBusyId('');
    }
  }

  return (
    <main className="wide-container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <LanguageSwitcher language={language} onChange={setLanguage} />
        <h1>{text.findFamilyTitle}</h1>
        <p>{text.findFamilyIntro}</p>
        <AuthStatus labels={text} />
      </header>

      <section className="family-connect">
        <FamilySearchCard
          mode={mode}
          query={query}
          results={results}
          requests={requests}
          message={message}
          sendingId={busyId}
          text={text}
          onQueryChange={setQuery}
          onSearch={search}
          onRequest={(profileId) => void requestFamily(profileId)}
        />

        <div className="family-panels">
          <FamilyRequestPanel
            title={text.requestsToAcceptTitle}
            empty={isLoadingFamily ? text.loadingRequests : text.requestsToAcceptEmpty}
            requests={incoming}
            busyId={busyId}
            text={text}
            onRespond={(requestId, status) => void respond(requestId, status)}
            onCancel={(requestId) => void cancel(requestId)}
          />
          <FamilyRequestPanel
            title={text.sentRequestsTitle}
            empty={isLoadingFamily ? text.loadingSentRequests : text.sentRequestsEmpty}
            requests={outgoing}
            busyId={busyId}
            text={text}
            onRespond={(requestId, status) => void respond(requestId, status)}
            onCancel={(requestId) => void cancel(requestId)}
          />
          <ConnectedFamilyPanel
            mode={mode}
            requests={accepted}
            text={text}
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
