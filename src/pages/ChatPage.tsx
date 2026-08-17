import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Auth } from '../components/Auth';
import { AuthStatus } from '../components/AuthStatus';
import { ChatContactHeader } from '../components/ChatContactHeader';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessages } from '../components/ChatMessages';
import { StreakBadge } from '../components/StreakBadge';
import { readAccountMode } from '../lib/accountMode';
import type { AccountMode } from '../lib/accountMode';
import { loadChatStreak, recordChatStreak } from '../lib/chatStreak';
import type { ChatStreak } from '../lib/chatStreak';
import type { ChatMediaType, ChatMessage } from '../lib/chat';
import {
  deleteDirectChatMessage,
  loadChatContacts,
  loadDirectChat,
  sendDirectChat,
} from '../lib/directChat';
import type { DirectChatMediaType, DirectChatMessage } from '../lib/directChat';
import type { FamilyProfile } from '../lib/familyConnections';
import { supabase } from '../lib/supabase';

export function ChatPage() {
  const [mode, setMode] = useState<AccountMode>(readAccountMode);
  const [contacts, setContacts] = useState<FamilyProfile[]>([]);
  const [activeContact, setActiveContact] = useState<FamilyProfile>();
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [initialText] = useState(readInitialQuestion);
  const [streak, setStreak] = useState<ChatStreak>({ currentStreak: 0, bestStreak: 0 });
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
        setActiveContact((contact) => contact ?? pickContact(nextContacts));
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load chat contacts.');
      });

    loadChatStreak()
      .then(setStreak)
      .catch(() => setStreak({ currentStreak: 0, bestStreak: 0 }));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !activeContact) return;

    refreshMessages(activeContact).catch((error: unknown) => {
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
    setMessage('');

    try {
      await sendDirectChat({ contact: activeContact, body: text });
      await updateStreak();
      setReplyTo(undefined);
      await refreshMessages(activeContact);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send message.');
    }
  }

  async function sendMedia(blob: Blob, mediaType: ChatMediaType) {
    if (!activeContact) return;
    setMessage('');

    try {
      await sendDirectChat({
        contact: activeContact,
        media: blob,
        mediaType: mediaType as DirectChatMediaType,
      });
      await updateStreak();
      await refreshMessages(activeContact);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send media.');
    }
  }

  async function updateStreak() {
    try {
      setStreak(await recordChatStreak());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update streak.');
    }
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
        <StreakBadge streak={streak} />
        <AuthStatus compact />
      </header>

      <section className="chat-shell">
        {!isAuthReady ? <ChatEmpty text="Checking your login..." /> : null}
        {isAuthReady && !isLoggedIn ? <ChatLogin /> : null}
        {isAuthReady && isLoggedIn ? (
          <>
            <ContactStrip
              activeContact={activeContact}
              contacts={contacts}
              onContactChange={setActiveContact}
            />
            {message && <p className="message">{message}</p>}
            {initialText && <InitialQuestion text={initialText} />}
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
                  initialText={initialText}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(undefined)}
                  onSendText={sendText}
                  onSendMedia={sendMedia}
                />
              </>
            ) : (
              <ChatEmpty
                text="No family connected yet."
                help="Send or accept a family request, then this becomes your real chat."
              />
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}

function ContactStrip({
  contacts,
  activeContact,
  onContactChange,
}: {
  contacts: FamilyProfile[];
  activeContact?: FamilyProfile;
  onContactChange: (contact: FamilyProfile) => void;
}) {
  return (
    <div className="chat-contact-strip">
      {contacts.length === 0 ? (
        <Link className="text-button" href="/find-family">Find family</Link>
      ) : (
        contacts.map((contact) => (
          <button
            className={activeContact?.id === contact.id ? 'chat-contact active' : 'chat-contact'}
            key={contact.id}
            type="button"
            onClick={() => onContactChange(contact)}
          >
            {contact.displayName}
          </button>
        ))
      )}
    </div>
  );
}

function ChatLogin() {
  return (
    <div className="chat-login-panel">
      <div>
        <p>Log in before chat.</p>
        <span>Use Google or email first, then connect your family.</span>
      </div>
      <Auth />
    </div>
  );
}

function ChatEmpty({ text, help }: { text: string; help?: string }) {
  return (
    <div className="chat-empty">
      <p>{text}</p>
      {help && <span>{help}</span>}
      {help && <Link className="text-button" href="/find-family">Find family</Link>}
    </div>
  );
}

function InitialQuestion({ text }: { text: string }) {
  return (
    <div className="chat-question">
      <span>Question from home</span>
      <p>{text}</p>
    </div>
  );
}

function pickContact(contacts: FamilyProfile[]) {
  const contactId = new URLSearchParams(window.location.search).get('contact');
  return contacts.find((contact) => contact.id === contactId) ?? contacts[0];
}

function readInitialQuestion() {
  return new URLSearchParams(window.location.search).get('question') ?? '';
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

  if (error || !data) return 'You';
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
