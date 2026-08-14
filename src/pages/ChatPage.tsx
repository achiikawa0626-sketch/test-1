import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Auth } from '../components/Auth';
import { AuthStatus } from '../components/AuthStatus';
import { ChatComposer } from '../components/ChatComposer';
import { ChatMessages } from '../components/ChatMessages';
import { FamilyChatProfileEditor } from '../components/FamilyChatProfileEditor';
import { readAccountMode } from '../lib/accountMode';
import { loadFamilyChatProfile, saveFamilyChatProfile } from '../lib/familyChatProfile';
import type { FamilyChatProfile } from '../lib/familyChatProfile';
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
  const [mode] = useState(readAccountMode);
  const [contacts, setContacts] = useState<FamilyProfile[]>([]);
  const [activeContact, setActiveContact] = useState<FamilyProfile>();
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [translatedMessage, setTranslatedMessage] = useState<{ id: string; text: string }>();
  const [familyProfile, setFamilyProfile] = useState(loadFamilyChatProfile);
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
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setIsAuthReady(true);
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

  function changeFamilyProfile(nextProfile: FamilyChatProfile) {
    setFamilyProfile(nextProfile);
    saveFamilyChatProfile(nextProfile);
  }

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
    setTranslatedMessage((current) => (current?.id === messageId ? undefined : current));
    await refreshMessages(activeContact);
  }

  async function translateMessage(chatMessage: ChatMessage) {
    if (!chatMessage.body.trim()) return;
    setMessage('Translating...');
    const { data, error } = await supabase.functions.invoke('ai', {
      body: {
        prompt: chatMessage.body,
        system: 'Translate this family chat message into simple English. Return only the translation.',
      },
    });

    if (error) {
      setMessage('Could not translate this message.');
      return;
    }

    setTranslatedMessage({ id: chatMessage.id, text: data.text ?? 'No translation found.' });
    setMessage('');
  }

  const chatMessages: ChatMessage[] = messages.map((item) => ({
    id: item.id,
    senderRole: item.isMine ? mode : item.senderRole,
    isMine: item.isMine,
    body: item.body,
    mediaType: item.mediaType,
    mediaUrl: item.mediaUrl,
    createdAt: item.createdAt,
  }));
  const storyText = chatMessages
    .map((item) => `${item.senderRole}: ${item.body}`)
    .filter((line) => line.trim().length > 0)
    .join('\n');

  return (
    <main className="chat-page">
      <header className="chat-header">
        <Link className="chat-back" href="/find-family">Back</Link>
        <FamilyChatProfileEditor
          profile={familyProfile}
          onChange={changeFamilyProfile}
          onMessage={setMessage}
        />
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
              translatedMessage={translatedMessage}
              onCopy={copyMessage}
              onDelete={deleteMessage}
              onTranslate={translateMessage}
            />
            <ChatComposer
              mode={mode}
              storyText={storyText}
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
