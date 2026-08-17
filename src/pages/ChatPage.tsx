import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Auth } from '../components/Auth';
import { AuthStatus } from '../components/AuthStatus';
import { ChatContactHeader } from '../components/ChatContactHeader';
import { ChatComposer } from '../components/ChatComposer';
import { ChatLoading } from '../components/ChatLoading';
import { ChatMessages } from '../components/ChatMessages';
import { readAccountMode } from '../lib/accountMode';
import type { AccountMode } from '../lib/accountMode';
import type { ChatMediaType, ChatMessage } from '../lib/chat';
import {
  deleteDirectChatMessage,
  loadChatContacts,
  loadDirectChat,
  sendDirectChat,
} from '../lib/directChat';
import type { DirectChatMediaType, DirectChatMessage } from '../lib/directChat';
import {
  loadDirectChatReactions,
  saveDirectChatReaction,
} from '../lib/directChatReactions';
import type { FamilyProfile } from '../lib/familyConnections';
import { generateFollowUpQuestionFromChat } from '../lib/followUpQuestion';
import { supabase } from '../lib/supabase';

type RealtimeMessageRow = {
  sender_id?: string;
  receiver_id?: string;
};

type ChatPresence = {
  user_id?: string;
};

export function ChatPage() {
  const [mode, setMode] = useState<AccountMode>(readAccountMode);
  const [contacts, setContacts] = useState<FamilyProfile[]>([]);
  const [activeContact, setActiveContact] = useState<FamilyProfile>();
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [initialText] = useState(readInitialQuestion);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<
    Record<string, { duration: string; expiresAt: number }>
  >({});
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState<ChatMessage>();
  const [myUserId, setMyUserId] = useState('');
  const [myName, setMyName] = useState('You');
  const [isContactOnline, setIsContactOnline] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);

  async function refreshMessages(contact = activeContact, showLoading = false) {
    if (!contact) return;
    if (showLoading) setIsLoadingMessages(true);

    try {
      const nextMessages = await loadDirectChat(contact.id);
      setMessages(nextMessages);
      setReactions(await loadDirectChatReactions(nextMessages.map((item) => item.id)));
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
      setIsAuthReady(true);
      setMyUserId(data.user?.id ?? '');
      if (data.user) {
        loadProfileMode(data.user.id).then(setMode).catch(() => undefined);
        loadProfileName(data.user.id).then(setMyName).catch(() => undefined);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setIsAuthReady(true);
      setMyUserId(session?.user.id ?? '');
      if (session?.user) {
        loadProfileMode(session.user.id).then(setMode).catch(() => undefined);
        loadProfileName(session.user.id).then(setMyName).catch(() => undefined);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setContacts([]);
      setActiveContact(undefined);
      setIsLoadingContacts(false);
      return;
    }

    setIsLoadingContacts(true);
    loadChatContacts()
      .then((nextContacts) => {
        setContacts(nextContacts);
        setActiveContact((contact) => contact ?? pickContact(nextContacts));
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load chat contacts.');
      })
      .finally(() => setIsLoadingContacts(false));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !activeContact) {
      setMessages([]);
      setIsLoadingMessages(false);
      return;
    }

    refreshMessages(activeContact, true).catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : 'Could not load messages.');
    });
  }, [activeContact?.id, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !activeContact) return undefined;
    let isActive = true;

    const refreshActiveChat = () => {
      if (!isActive) return;
      refreshMessages(activeContact).catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not refresh messages.');
      });
    };

    const channel = supabase
      .channel(`direct-chat-${activeContact.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_chat_messages' },
        (payload) => {
          const row = readRealtimeMessageRow(payload);
          if (row && isContactMessage(row, activeContact.id)) refreshActiveChat();
        },
      )
      .subscribe();
    const backupTimer = window.setInterval(refreshActiveChat, 10_000);

    return () => {
      isActive = false;
      window.clearInterval(backupTimer);
      void supabase.removeChannel(channel);
    };
  }, [activeContact?.id, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !activeContact || !myUserId) {
      setIsContactOnline(false);
      return undefined;
    }

    const contactId = activeContact.id;
    const channel = supabase.channel(`presence-${chatRoomId(myUserId, contactId)}`, {
      config: { presence: { key: myUserId } },
    });

    function updateOnlineStatus() {
      const presences = Object.values(channel.presenceState()).flat() as ChatPresence[];
      setIsContactOnline(presences.some((presence) => presence.user_id === contactId));
    }

    channel
      .on('presence', { event: 'sync' }, updateOnlineStatus)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void channel.track({ user_id: myUserId });
      });

    return () => {
      setIsContactOnline(false);
      void supabase.removeChannel(channel);
    };
  }, [activeContact?.id, isLoggedIn, myUserId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPinnedMessages((current) => removeExpiredPins(current));
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const latestAnswerId = findLatestGrandparentAnswerId(messages);

  useEffect(() => {
    if (mode !== 'kid' || !activeContact || !latestAnswerId) {
      setFollowUpQuestion('');
      setIsGeneratingFollowUp(false);
      return;
    }

    void loadFollowUpQuestion();
  }, [activeContact?.id, latestAnswerId, mode]);

  async function sendText(text: string) {
    if (!activeContact || isSending) return;
    setIsSending(true);
    setMessage('');

    try {
      await sendDirectChat({ contact: activeContact, body: text });
      setReplyTo(undefined);
      await refreshMessages(activeContact);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  }

  async function sendMedia(blob: Blob, mediaType: ChatMediaType, transcript?: string) {
    if (!activeContact || isSending) return;
    setIsSending(true);
    setMessage('');
    const transcriptBody = transcript?.trim()
      ? `Story transcript: ${transcript.trim()}`
      : undefined;

    try {
      await sendDirectChat({
        contact: activeContact,
        body: transcriptBody,
        media: blob,
        mediaType: mediaType as DirectChatMediaType,
      });
      await refreshMessages(activeContact);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send media.');
    } finally {
      setIsSending(false);
    }
  }

  async function loadFollowUpQuestion() {
    if (!activeContact) return;
    setIsGeneratingFollowUp(true);
    setFollowUpQuestion('');

    try {
      setFollowUpQuestion(await generateFollowUpQuestionFromChat(activeContact, messages));
    } finally {
      setIsGeneratingFollowUp(false);
    }
  }

  async function sendFollowUpQuestion(text: string) {
    await sendText(text);
    setFollowUpQuestion('');
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

  async function reactToMessage(messageId: string, reaction: string) {
    setReactions((current) => ({ ...current, [messageId]: reaction }));
    try {
      await saveDirectChatReaction(messageId, reaction);
      setMessage('Reaction added.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save reaction.');
    }
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
  const isLoadingChat = isLoadingContacts || (Boolean(activeContact) && isLoadingMessages);

  return (
    <main className={`chat-page chat-page--${mode}`}>
      <header className="chat-header">
        <Link className="chat-back" href="/find-family">Back</Link>
        <ChatContactHeader contact={activeContact} isOnline={isContactOnline} />
        <AuthStatus compact />
      </header>

      <section className="chat-shell">
        {!isAuthReady ? <ChatEmpty text="Checking your login..." /> : null}
        {isAuthReady && !isLoggedIn ? <ChatLogin /> : null}
        {isAuthReady && isLoggedIn ? (
          isLoadingChat ? (
            <ChatLoading text="Loading family chat..." />
          ) : (
          <>
            {!isLoadingContacts && (
              <ContactStrip
                activeContact={activeContact}
                contacts={contacts}
                onContactChange={setActiveContact}
              />
            )}
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
                  onPin={pinMessage}
                  onReact={reactToMessage}
                  onReply={setReplyTo}
                />
                <ChatComposer
                  mode={mode}
                  followUpQuestion={followUpQuestion}
                  initialText={initialText}
                  isGeneratingFollowUp={isGeneratingFollowUp}
                  replyTo={replyTo}
                  isSending={isSending}
                  onCancelReply={() => setReplyTo(undefined)}
                  onRefreshFollowUp={() => void loadFollowUpQuestion()}
                  onSendFollowUp={sendFollowUpQuestion}
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
          )
        ) : null}
      </section>
    </main>
  );
}

function findLatestGrandparentAnswerId(messages: DirectChatMessage[]) {
  return [...messages].reverse().find((message) => !message.isMine && message.body.trim())?.id ?? '';
}

function readRealtimeMessageRow(payload: { new: unknown; old: unknown }) {
  const row = payload.new || payload.old;
  if (!row || typeof row !== 'object') return null;
  return row as RealtimeMessageRow;
}

function isContactMessage(row: RealtimeMessageRow, contactId: string) {
  return row.sender_id === contactId || row.receiver_id === contactId;
}

function chatRoomId(firstUserId: string, secondUserId: string) {
  return [firstUserId, secondUserId].sort().join('-');
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
