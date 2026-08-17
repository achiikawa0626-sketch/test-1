import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Auth } from '../components/Auth';
import { AuthStatus } from '../components/AuthStatus';
import { ChatContactHeader } from '../components/ChatContactHeader';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessages } from '../components/ChatMessages';
import { readAccountMode } from '../lib/accountMode';
import type { AccountMode } from '../lib/accountMode';
import {
  deleteDirectChatMessage,
  loadChatContacts,
  loadDirectChat,
  sendDirectChat,
} from '../lib/directChat';
import type { DirectChatMediaType, DirectChatMessage } from '../lib/directChat';
import type { ChatMediaType, ChatMessage } from '../lib/chat';
import type { FamilyProfile } from '../lib/familyConnections';
import { supabase } from '../lib/supabase';

export function ChatPage() {
  const [mode, setMode] = useState<AccountMode>(readAccountMode);
  const [contacts, setContacts] = useState<FamilyProfile[]>([]);
  const [activeContact, setActiveContact] = useState<FamilyProfile>();
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<
    Record<string, { duration: string; expiresAt: number }>
  >({});
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<ChatMessage>();
  const [myName, setMyName] = useState('You');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  async function refreshMessages(contact = activeContact) {
    if (!contact) return;
    setMessages(await loadDirectChat(contact.id));
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
      setIsAuthReady(true);
      if (data.user) {
        loadProfileMode(data.user.id).then(setMode).catch(() => undefined);
        loadProfileName(data.user.id).then(setMyName).catch(() => undefined);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setIsAuthReady(true);
      if (session?.user) {
        loadProfileMode(session.user.id).then(setMode).catch(() => undefined);
        loadProfileName(session.user.id).then(setMyName).catch(() => undefined);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    loadChatContacts()
      .then((nextContacts) => {
        setContacts(nextContacts);
        setActiveContact((currentContact) => currentContact ?? nextContacts[0]);
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load family chats.');
      });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !activeContact) return;

    refreshMessages().catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : 'Could not load messages.');
    });
  }, [activeContact?.id, isLoggedIn]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPinnedMessages((current) => removeExpiredPins(current));
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  async function sendText(text: string) {
    if (!activeContact) return;
    await sendDirectChat({ contact: activeContact, body: text });
    await refreshMessages(activeContact);
  }

  async function sendMedia(blob: Blob, mediaType: ChatMediaType) {
    if (!activeContact) return;
    await sendDirectChat({
      contact: activeContact,
      media: blob,
      mediaType: mediaType as DirectChatMediaType,
    });
    await refreshMessages(activeContact);
  }

  async function copyMessage(text: string) {
    await navigator.clipboard.writeText(text);
    setMessage('Message copied.');
  }

  async function deleteMessage(messageId: string) {
    await deleteDirectChatMessage(messageId);
    setFavoriteIds((current) => current.filter((id) => id !== messageId));
    setPinnedMessages((current) => {
      const { [messageId]: _deletedPin, ...nextPins } = current;
      return nextPins;
    });
    setReactions((current) => {
      const { [messageId]: _deletedReaction, ...nextReactions } = current;
      return nextReactions;
    });
    setReplyTo((current) => (current?.id === messageId ? undefined : current));
    await refreshMessages(activeContact);
  }

  async function forwardMessage(chatMessage: ChatMessage) {
    const text = chatMessage.body || `${chatMessage.mediaType ?? 'media'} message`;
    await navigator.clipboard.writeText(`Forwarded message: ${text}`);
    setMessage('Message ready to forward. It was copied.');
  }

  async function reactToMessage(messageId: string, reaction: string) {
    setReactions((current) => ({ ...current, [messageId]: reaction }));
    setMessage('Reaction added.');
  }

  async function toggleFavorite(chatMessage: ChatMessage) {
    setFavoriteIds((current) =>
      current.includes(chatMessage.id)
        ? current.filter((id) => id !== chatMessage.id)
        : [...current, chatMessage.id],
    );
    setMessage('Favorite updated.');
  }

  async function pinMessage(chatMessage: ChatMessage, duration: string) {
    setPinnedMessages((current) => ({
      ...current,
      [chatMessage.id]: {
        duration,
        expiresAt: Date.now() + pinDurationMs(duration),
      },
    }));
    setMessage(`Message pinned for ${duration}.`);
  }

  async function reportMessage() {
    setMessage('Message reported. Thank you.');
  }

  const chatMessages: ChatMessage[] = messages.map((item) => ({
    id: item.id,
    senderRole: item.isMine ? mode : activeContact?.accountMode ?? item.senderRole,
    senderName: item.isMine
      ? myName
      : activeContact?.username
        ? `@${activeContact.username}`
        : activeContact?.displayName,
    isMine: item.isMine,
    body: item.body,
    mediaType: item.mediaType,
    mediaUrl: item.mediaUrl,
    createdAt: item.createdAt,
  }));
  return (
    <main className={`chat-page chat-page--${mode}`}>
      <header className="chat-header">
        <Link className="chat-back" href="/find-family">Back</Link>
        <ChatContactHeader contact={activeContact} />
        <AuthStatus compact />
      </header>

      <section className="chat-shell">
        {!isAuthReady ? (
          <div className="chat-empty">
            <p>Checking your login...</p>
          </div>
        ) : !isLoggedIn ? (
          <div className="chat-login-panel">
            <div>
              <p>Log in before chat.</p>
              <span>Use Google or email first, then connect your family.</span>
            </div>
            <Auth />
          </div>
        ) : (
          <>
        <div className="chat-contact-strip">
          {contacts.length === 0 ? (
            <Link className="text-button" href="/find-family">Find family</Link>
          ) : (
            contacts.map((contact) => (
              <button
                className={activeContact?.id === contact.id ? 'chat-contact active' : 'chat-contact'}
                key={contact.id}
                type="button"
                onClick={() => setActiveContact(contact)}
              >
                {contact.displayName}
              </button>
            ))
          )}
        </div>

        {message && <p className="message">{message}</p>}
        {activeContact ? (
          <>
            <ChatMessages
              messages={chatMessages}
              favoriteIds={favoriteIds}
              pinnedMessages={pinnedMessages}
              reactions={reactions}
              onCopy={copyMessage}
              onDelete={deleteMessage}
              onFavorite={toggleFavorite}
              onForward={forwardMessage}
              onPin={pinMessage}
              onReact={reactToMessage}
              onReply={setReplyTo}
              onReport={reportMessage}
            />
            <ChatComposer
              mode={mode}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(undefined)}
              onSendText={sendText}
              onSendMedia={sendMedia}
            />
          </>
        ) : (
          <div className="chat-empty">
            <p>No family connected yet.</p>
            <span>Send or accept a family request, then this becomes your real chat.</span>
            <Link className="text-button" href="/find-family">Find family</Link>
          </div>
        )}
          </>
        )}
      </section>
    </main>
  );
}

async function loadProfileMode(userId: string): Promise<AccountMode> {
  const { data, error } = await supabase
    .from('profiles')
    .select('account_mode')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data?.account_mode) return readAccountMode();
  return data.account_mode as AccountMode;
}

async function loadProfileName(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) return 'You';
  if (!data) return 'You';
  return data.display_name || 'You';
}

function pinDurationMs(duration: string) {
  if (duration === '24 hours') return 24 * 60 * 60 * 1000;
  if (duration === '30 days') return 30 * 24 * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
}

function removeExpiredPins(
  pins: Record<string, { duration: string; expiresAt: number }>,
) {
  return Object.fromEntries(
    Object.entries(pins).filter(([, pin]) => pin.expiresAt > Date.now()),
  );
}
