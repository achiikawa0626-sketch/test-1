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
import { useAppLanguage } from '../lib/appLanguage';
import type { ChatMediaType, ChatMessage } from '../lib/chat';
import {
  readCachedContact,
  readCachedMessages,
  saveCachedContact,
  saveCachedMessages,
} from '../lib/chatCache';
import { generateChatBook } from '../lib/chatBook';
import { downloadChatBookHtml } from '../lib/chatBookHtml';
import {
  deleteDirectChatMessage,
  loadChatContacts,
  loadDirectChat,
  loadDirectChatMediaUrls,
  sendDirectChat,
} from '../lib/directChat';
import type { DirectChatMediaType, DirectChatMessage } from '../lib/directChat';
import {
  loadDirectChatMessageActions,
  saveDirectChatPin,
  toggleDirectChatFavorite,
} from '../lib/directChatMessageActions';
import type { DirectChatMessageActions } from '../lib/directChatMessageActions';
import {
  loadDirectChatReactions,
  saveDirectChatReaction,
} from '../lib/directChatReactions';
import type { DirectChatReaction } from '../lib/directChatReactions';
import type { FamilyProfile } from '../lib/familyConnections';
import {
  generateFollowUpQuestionsFromChat,
  refreshFollowUpQuestionsFromChat,
} from '../lib/followUpQuestion';
import { homeTranslations } from '../lib/homeTranslations';
import type { HomeTranslation } from '../lib/homeTranslations';
import {
  loadPrivateContactAvatar,
  uploadPrivateContactAvatar,
} from '../lib/privateContactAvatars';
import { supabase } from '../lib/supabase';

type RealtimeMessageRow = {
  sender_id?: string;
  receiver_id?: string;
};

type ChatPresence = {
  user_id?: string;
};

type ChatProfile = {
  mode: AccountMode;
  name: string;
};

export function ChatPage() {
  const [language] = useAppLanguage();
  const text = homeTranslations[language];
  const [mode, setMode] = useState<AccountMode>(readAccountMode);
  const [contacts, setContacts] = useState<FamilyProfile[]>([]);
  const [activeContact, setActiveContact] = useState<FamilyProfile | undefined>(readInitialContact);
  const [messages, setMessages] = useState<DirectChatMessage[]>(readInitialMessages);
  const [message, setMessage] = useState('');
  const [initialText] = useState(readInitialQuestion);
  const [messageActions, setMessageActions] = useState<DirectChatMessageActions>({});
  const [reactions, setReactions] = useState<Record<string, DirectChatReaction[]>>({});
  const [replyTo, setReplyTo] = useState<ChatMessage>();
  const [myUserId, setMyUserId] = useState('');
  const [myName, setMyName] = useState('You');
  const [contactAvatarUrl, setContactAvatarUrl] = useState<string>();
  const [isContactOnline, setIsContactOnline] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isExportingBook, setIsExportingBook] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingContactAvatar, setIsUploadingContactAvatar] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);

  async function refreshMessages(contact = activeContact, showLoading = false) {
    if (!contact) return;
    if (showLoading) setIsLoadingMessages(true);

    try {
      const nextMessages = await loadDirectChat(contact.id);
      const messageIds = nextMessages.map((item) => item.id);
      setMessages(nextMessages);
      saveCachedMessages(contact.id, nextMessages);
      void refreshMediaUrls(nextMessages);
      void refreshMessageExtras(messageIds);
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  }

  async function refreshMediaUrls(nextMessages: DirectChatMessage[]) {
    try {
      const messagesWithUrls = await loadDirectChatMediaUrls(nextMessages);
      setMessages((current) => mergeMediaUrls(current, messagesWithUrls));
    } catch {
      return;
    }
  }

  async function refreshMessageExtras(messageIds: string[]) {
    try {
      const [nextActions, nextReactions] = await Promise.all([
        loadDirectChatMessageActions(messageIds),
        loadDirectChatReactions(messageIds),
      ]);
      setMessageActions(nextActions);
      setReactions(nextReactions);
    } catch {
      setMessageActions({});
      setReactions({});
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setIsLoggedIn(Boolean(user));
      setIsAuthReady(true);
      setMyUserId(user?.id ?? '');
      if (user) {
        loadChatProfile(user.id)
          .then((profile) => {
            setMode(profile.mode);
            setMyName(profile.name);
          })
          .catch(() => undefined);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setIsAuthReady(true);
      setMyUserId(session?.user.id ?? '');
      if (session?.user) {
        loadChatProfile(session.user.id)
          .then((profile) => {
            setMode(profile.mode);
            setMyName(profile.name);
          })
          .catch(() => undefined);
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
        setActiveContact((contact) => {
          const nextContact = pickContact(nextContacts, contact);
          if (nextContact) saveCachedContact(nextContact);
          return nextContact;
        });
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load chat contacts.');
      })
      .finally(() => setIsLoadingContacts(false));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!activeContact) return;
    saveCachedContact(activeContact);

    const cachedMessages = readCachedMessages(activeContact.id);
    if (cachedMessages.length > 0) setMessages(cachedMessages);
  }, [activeContact?.id]);

  useEffect(() => {
    if (!isLoggedIn || !activeContact) {
      setMessages([]);
      setMessageActions({});
      setReactions({});
      setIsLoadingMessages(false);
      return;
    }

    refreshMessages(activeContact, true).catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : 'Could not load messages.');
    });
  }, [activeContact?.id, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !activeContact) {
      setContactAvatarUrl(undefined);
      return;
    }

    loadPrivateContactAvatar(activeContact.id)
      .then(setContactAvatarUrl)
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not load chat photo.');
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_chat_reactions' },
        refreshActiveChat,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_chat_message_actions' },
        refreshActiveChat,
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

  const latestAnswerId = findLatestGrandparentAnswerId(messages);

  useEffect(() => {
    if (mode !== 'kid' || !activeContact || !latestAnswerId) {
      setFollowUpQuestions([]);
      setIsGeneratingFollowUp(false);
      return;
    }

    void loadFollowUpQuestions();
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

  async function loadFollowUpQuestions(isRefresh = false) {
    if (!activeContact) return;
    setIsGeneratingFollowUp(true);
    setFollowUpQuestions([]);

    try {
      const nextQuestions = isRefresh
        ? await refreshFollowUpQuestionsFromChat(messages)
        : await generateFollowUpQuestionsFromChat(messages);
      setFollowUpQuestions(nextQuestions);
    } finally {
      setIsGeneratingFollowUp(false);
    }
  }

  async function copyMessage(text: string) {
    await navigator.clipboard.writeText(text);
    setMessage('Message copied.');
  }

  async function deleteMessage(messageId: string) {
    await deleteDirectChatMessage(messageId);
    setMessageActions((current) => {
      const { [messageId]: _deletedActions, ...nextActions } = current;
      return nextActions;
    });
    setReactions((current) => {
      const { [messageId]: _deletedReaction, ...nextReactions } = current;
      return nextReactions;
    });
    setReplyTo((current) => (current?.id === messageId ? undefined : current));
    await refreshMessages(activeContact);
  }

  async function reactToMessage(messageId: string, reaction: string) {
    try {
      await saveDirectChatReaction(messageId, reaction);
      await refreshMessages(activeContact);
      setMessage('Reaction added.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save reaction.');
    }
  }

  async function toggleFavorite(chatMessage: ChatMessage) {
    try {
      const isFavorite = await toggleDirectChatFavorite(chatMessage.id);
      await refreshMessages(activeContact);
      setMessage(isFavorite ? 'Favorite added.' : 'Favorite removed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update favorite.');
    }
  }

  async function pinMessage(chatMessage: ChatMessage, duration: string) {
    try {
      await saveDirectChatPin({
        messageId: chatMessage.id,
        duration,
        expiresAt: Date.now() + pinDurationMs(duration),
      });
      await refreshMessages(activeContact);
      setMessage(`Message pinned for ${duration}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not pin message.');
    }
  }

  async function changeContactAvatar(file: File) {
    if (!activeContact || isUploadingContactAvatar) return;
    setIsUploadingContactAvatar(true);
    setMessage('');

    try {
      setContactAvatarUrl(await uploadPrivateContactAvatar(activeContact.id, file));
      setMessage(text.chatPhotoUpdated);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update chat photo.');
    } finally {
      setIsUploadingContactAvatar(false);
    }
  }

  async function exportChatBook() {
    if (!activeContact || isExportingBook) return;
    setIsExportingBook(true);
    setMessage('');

    try {
      const bookMessages = await loadDirectChat(activeContact.id);
      setMessages(bookMessages);
      saveCachedMessages(activeContact.id, bookMessages);
      const book = await generateChatBook({
        contact: activeContact,
        messages: bookMessages,
        myName,
      });
      downloadChatBookHtml(book);
      setMessage(text.bookDownloaded);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not make the book from this text.');
    } finally {
      setIsExportingBook(false);
    }
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
  const isLoadingChat =
    messages.length === 0 && (isLoadingContacts || (Boolean(activeContact) && isLoadingMessages));
  const canShowChat =
    (isAuthReady && isLoggedIn) || (!isAuthReady && Boolean(activeContact) && messages.length > 0);
  const visibleContacts = contacts.length > 0 ? contacts : activeContact ? [activeContact] : [];

  return (
    <main className={`chat-page chat-page--${mode}`}>
      <header className="chat-header">
        <Link className="chat-back" href="/find-family">{text.backButton}</Link>
        <ChatContactHeader
          contact={activeContact}
          customAvatarUrl={contactAvatarUrl}
          isOnline={isContactOnline}
          isUploadingAvatar={isUploadingContactAvatar}
          text={text}
          onAvatarChange={changeContactAvatar}
        />
        <AuthStatus compact labels={text} />
      </header>

      <section className="chat-shell">
        {!isAuthReady && !canShowChat ? <ChatEmpty text={text.checkingLogin} /> : null}
        {isAuthReady && !isLoggedIn ? <ChatLogin text={text} /> : null}
        {canShowChat ? (
          isLoadingChat ? (
            <ChatLoading text={text.loadingFamilyChat} />
          ) : (
          <>
            {!isLoadingContacts && (
              <ContactStrip
                activeContact={activeContact}
                contacts={visibleContacts}
                isExportingBook={isExportingBook}
                text={text}
                onContactChange={setActiveContact}
                onExportBook={activeContact ? exportChatBook : undefined}
              />
            )}
            {message && <p className="message">{message}</p>}
            {initialText && <InitialQuestion label={text.questionFromHome} text={initialText} />}
            {activeContact ? (
              <>
                <ChatMessages
                  messages={chatMessages}
                  messageActions={messageActions}
                  reactions={reactions}
                  text={text}
                  onCopy={copyMessage}
                  onDelete={deleteMessage}
                  onFavorite={toggleFavorite}
                  onPin={pinMessage}
                  onReact={reactToMessage}
                  onReply={setReplyTo}
                />
                <ChatComposer
                  mode={mode}
                  followUpQuestions={followUpQuestions}
                  initialText={initialText}
                  isGeneratingFollowUp={isGeneratingFollowUp}
                  replyTo={replyTo}
                  isSending={isSending}
                  text={text}
                  onCancelReply={() => setReplyTo(undefined)}
                  onRefreshFollowUp={() => void loadFollowUpQuestions(true)}
                  onSendText={sendText}
                  onSendMedia={sendMedia}
                />
              </>
            ) : (
              <ChatEmpty
                text={text.noFamilyConnected}
                help={text.noFamilyConnectedHelp}
                linkLabel={text.findFamilyButton}
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
  isExportingBook,
  text,
  onContactChange,
  onExportBook,
}: {
  contacts: FamilyProfile[];
  activeContact?: FamilyProfile;
  isExportingBook: boolean;
  text: HomeTranslation;
  onContactChange: (contact: FamilyProfile) => void;
  onExportBook?: () => Promise<void>;
}) {
  return (
    <div className="chat-contact-strip">
      <div className="chat-contact-strip__list">
        {contacts.length === 0 ? (
          <Link className="text-button" href="/find-family">{text.findFamilyButton}</Link>
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
      {onExportBook && (
        <button
          className="chat-book-button"
          type="button"
          disabled={isExportingBook}
          onClick={() => void onExportBook()}
        >
          {isExportingBook ? text.writingLabel : text.exportBookButton}
        </button>
      )}
    </div>
  );
}

function ChatLogin({ text }: { text: HomeTranslation }) {
  return (
    <div className="chat-login-panel">
      <div>
        <p>{text.logInBeforeChat}</p>
        <span>{text.chatLoginHelp}</span>
      </div>
      <Auth />
    </div>
  );
}

function ChatEmpty({
  text,
  help,
  linkLabel,
}: {
  text: string;
  help?: string;
  linkLabel?: string;
}) {
  return (
    <div className="chat-empty">
      <p>{text}</p>
      {help && <span>{help}</span>}
      {help && <Link className="text-button" href="/find-family">{linkLabel}</Link>}
    </div>
  );
}

function InitialQuestion({ label, text }: { label: string; text: string }) {
  return (
    <div className="chat-question">
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function pickContact(contacts: FamilyProfile[], fallback?: FamilyProfile) {
  const contactId = new URLSearchParams(window.location.search).get('contact');
  return contacts.find((contact) => contact.id === contactId) ?? fallback ?? contacts[0];
}

function readInitialQuestion() {
  return new URLSearchParams(window.location.search).get('question') ?? '';
}

function readInitialContact() {
  const cachedContact = readCachedContact();
  const contactId = new URLSearchParams(window.location.search).get('contact');
  if (!contactId || cachedContact?.id === contactId) return cachedContact;
  return undefined;
}

function readInitialMessages() {
  const contactId = new URLSearchParams(window.location.search).get('contact') ?? '';
  return readCachedMessages(contactId);
}

function mergeMediaUrls(current: DirectChatMessage[], next: DirectChatMessage[]) {
  const mediaUrlById = new Map(next.map((message) => [message.id, message.mediaUrl]));
  return current.map((message) => ({
    ...message,
    mediaUrl: mediaUrlById.get(message.id) ?? message.mediaUrl,
  }));
}

async function loadChatProfile(userId: string): Promise<ChatProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('account_mode, display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return { mode: readAccountMode(), name: 'You' };
  return {
    mode: (data.account_mode as AccountMode | null) ?? readAccountMode(),
    name: data.display_name || 'You',
  };
}

function pinDurationMs(duration: string) {
  if (duration === '24 hours') return 24 * 60 * 60 * 1000;
  if (duration === '30 days') return 30 * 24 * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
}
