import { useEffect, useState } from 'react';
import { ChatHeader } from '../components/ChatHeader';
import { ChatShell } from '../components/ChatShell';
import { readAccountMode } from '../lib/accountMode';
import { loadFamilyChatProfile, saveFamilyChatProfile } from '../lib/familyChatProfile';
import type { FamilyChatProfile } from '../lib/familyChatProfile';
import { loadChatContacts, loadDirectChat, sendDirectChat } from '../lib/directChat';
import type { DirectChatMediaType, DirectChatMessage } from '../lib/directChat';
import { loadChatStreak, recordChatStreak } from '../lib/chatStreak';
import type { ChatStreak } from '../lib/chatStreak';
import type { ChatMediaType, ChatMessage } from '../lib/chat';
import type { FamilyProfile } from '../lib/familyConnections';
import { supabase } from '../lib/supabase';

export function ChatPage() {
  const [mode] = useState(readAccountMode);
  const [contacts, setContacts] = useState<FamilyProfile[]>([]);
  const [activeContact, setActiveContact] = useState<FamilyProfile>();
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [streak, setStreak] = useState<ChatStreak>({ currentStreak: 0, bestStreak: 0 });
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
        setActiveContact((contact) => contact ?? nextContacts[0]);
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

  function changeFamilyProfile(nextProfile: FamilyChatProfile) {
    setFamilyProfile(nextProfile);
    saveFamilyChatProfile(nextProfile);
  }

  async function sendText(text: string) {
    if (!activeContact) return;
    setMessage('');

    try {
      await sendDirectChat({ contact: activeContact, body: text });
      await updateStreak();
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

  const chatMessages: ChatMessage[] = messages.map((item) => ({
    id: item.id,
    senderRole: item.isMine ? mode : item.senderRole,
    body: item.body,
    mediaType: item.mediaType,
    mediaUrl: item.mediaUrl,
    createdAt: item.createdAt,
  }));
  return (
    <main className="chat-page">
      <ChatHeader
        familyProfile={familyProfile}
        streak={streak}
        onProfileChange={changeFamilyProfile}
        onMessage={setMessage}
      />
      <ChatShell
        mode={mode}
        contacts={contacts}
        activeContact={activeContact}
        messages={chatMessages}
        message={message}
        isAuthReady={isAuthReady}
        isLoggedIn={isLoggedIn}
        onContactChange={setActiveContact}
        onSendText={sendText}
        onSendMedia={sendMedia}
      />
    </main>
  );
}
