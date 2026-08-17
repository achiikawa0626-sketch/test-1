import { useState } from 'react';
import { MessageActionMenu } from './MessageActionMenu';
import type { ChatMessage } from '../lib/chat';

type ChatMessagesProps = {
  messages: ChatMessage[];
  favoriteIds: string[];
  pinnedMessages: Record<string, { duration: string; expiresAt: number }>;
  reactions: Record<string, string>;
  onCopy: (text: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onFavorite: (message: ChatMessage) => Promise<void>;
  onForward: (message: ChatMessage) => Promise<void>;
  onPin: (message: ChatMessage, duration: string) => Promise<void>;
  onReact: (messageId: string, reaction: string) => Promise<void>;
  onReply: (message: ChatMessage) => void;
  onReport: (message: ChatMessage) => Promise<void>;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ChatMessages({
  messages,
  favoriteIds,
  pinnedMessages,
  reactions,
  onCopy,
  onDelete,
  onFavorite,
  onForward,
  onPin,
  onReact,
  onReply,
  onReport,
}: ChatMessagesProps) {
  const [openMessageId, setOpenMessageId] = useState<string>();
  const pinnedMessage = messages.find((message) => {
    const pin = pinnedMessages[message.id];
    return pin && pin.expiresAt > Date.now();
  });

  if (messages.length === 0) {
    return (
      <div className="chat-empty">
        <p>No messages yet.</p>
        <span>Kid can type. Grandma can answer with voice or video.</span>
      </div>
    );
  }

  return (
    <div className="chat-messages" aria-label="Chat messages">
      {pinnedMessage && (
        <div className="chat-pinned-preview">
          <span>📌</span>
          <p>{pinnedMessage.body || `${pinnedMessage.mediaType ?? 'Media'} message`}</p>
        </div>
      )}
      {messages.map((message) => {
        const isOpen = openMessageId === message.id;
        const pin = pinnedMessages[message.id];
        const activePin = pin && pin.expiresAt > Date.now() ? pin : undefined;

        return (
          <article
            className={`chat-bubble ${message.isMine ? 'mine' : 'theirs'} ${message.senderRole}`}
            key={message.id}
          >
            <button
              className="chat-bubble__menu-trigger"
              type="button"
              aria-label="Open message actions"
              onClick={() => setOpenMessageId(isOpen ? undefined : message.id)}
            >
              +
            </button>
            <p className="chat-bubble__role">
              {message.senderRole === 'kid' ? 'Kid' : 'Grandma'}
            </p>
            {message.body && <p className="chat-bubble__text">{message.body}</p>}
            {message.mediaType === 'audio' && message.mediaUrl && (
              <audio src={message.mediaUrl} controls />
            )}
            {message.mediaType === 'video' && message.mediaUrl && (
              <video src={message.mediaUrl} controls />
            )}
            {(activePin || favoriteIds.includes(message.id)) && (
              <p className="chat-bubble__badge">
                {activePin ? `Pinned ${activePin.duration}` : 'Favorite'}
              </p>
            )}
            {reactions[message.id] && (
              <span className="chat-bubble__reaction">{reactions[message.id]}</span>
            )}
            {isOpen && (
              <MessageActionMenu
                message={message}
                onClose={() => setOpenMessageId(undefined)}
                onCopy={onCopy}
                onDelete={onDelete}
                onFavorite={onFavorite}
                onForward={onForward}
                onPin={onPin}
                onReact={onReact}
                onReply={onReply}
                onReport={onReport}
              />
            )}
            <time>{formatTime(message.createdAt)}</time>
          </article>
        );
      })}
    </div>
  );
}
