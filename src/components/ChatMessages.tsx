import { Fragment, useState } from 'react';
import { ChatDateDivider } from './ChatDateDivider';
import { MessageActionMenu } from './MessageActionMenu';
import type { ChatMessage } from '../lib/chat';
import { messageDayKey } from '../lib/chatDates';
import type { DirectChatMessageActions } from '../lib/directChatMessageActions';
import type { DirectChatReaction } from '../lib/directChatReactions';

type ChatMessagesProps = {
  messages: ChatMessage[];
  messageActions: DirectChatMessageActions;
  reactions: Record<string, DirectChatReaction[]>;
  onCopy: (text: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onFavorite: (message: ChatMessage) => Promise<void>;
  onPin: (message: ChatMessage, duration: string) => Promise<void>;
  onReact: (messageId: string, reaction: string) => Promise<void>;
  onReply: (message: ChatMessage) => void;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ChatMessages({
  messages,
  messageActions,
  reactions,
  onCopy,
  onDelete,
  onFavorite,
  onPin,
  onReact,
  onReply,
}: ChatMessagesProps) {
  const [openMenu, setOpenMenu] = useState<{ id: string; placement: 'bottom' | 'top' }>();
  const pinnedMessage = messages.find((message) => {
    const pins = messageActions[message.id]?.pins ?? [];
    return pins.some((pin) => pin.expiresAt > Date.now());
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
      {messages.map((message, index) => {
        const isOpen = openMenu?.id === message.id;
        const actions = messageActions[message.id];
        const activePin = actions?.pins.find((pin) => pin.expiresAt > Date.now());
        const hasFavorite = Boolean(actions?.favoriteUserIds.length);
        const messageReactions = reactions[message.id] ?? [];
        const previousMessage = messages[index - 1];
        const startsNewDay =
          !previousMessage || messageDayKey(previousMessage.createdAt) !== messageDayKey(message.createdAt);

        return (
          <Fragment key={message.id}>
            {startsNewDay && <ChatDateDivider date={message.createdAt} />}
            <article
              className={`chat-bubble ${message.isMine ? 'mine' : 'theirs'} ${message.senderRole}`}
            >
              <button
                className="chat-bubble__menu-trigger"
                type="button"
                aria-label="Open message actions"
                onClick={(event) => {
                  if (isOpen) {
                    setOpenMenu(undefined);
                    return;
                  }

                  const rect = event.currentTarget.getBoundingClientRect();
                  const spaceBelow = window.innerHeight - rect.bottom;
                  setOpenMenu({
                    id: message.id,
                    placement: spaceBelow < 260 ? 'top' : 'bottom',
                  });
                }}
              >
                +
              </button>
              <p className="chat-bubble__role">
                {message.senderName ?? (message.senderRole === 'kid' ? 'You' : 'Grandma')}
              </p>
              {message.body && <p className="chat-bubble__text">{message.body}</p>}
              {message.mediaType === 'audio' && message.mediaUrl && (
                <audio src={message.mediaUrl} controls />
              )}
              {message.mediaType === 'video' && message.mediaUrl && (
                <video src={message.mediaUrl} controls />
              )}
              {(activePin || hasFavorite) && (
                <p className="chat-bubble__badge">
                  {[activePin ? `Pinned ${activePin.duration}` : '', hasFavorite ? 'Favorite' : '']
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {messageReactions.length > 0 && (
                <span className="chat-bubble__reaction">
                  {messageReactions.map((item) => item.reaction).join(' ')}
                </span>
              )}
              {isOpen && (
                <MessageActionMenu
                  message={message}
                  placement={openMenu.placement}
                  onClose={() => setOpenMenu(undefined)}
                  onCopy={onCopy}
                  onDelete={onDelete}
                  onFavorite={onFavorite}
                  onPin={onPin}
                  onReact={onReact}
                  onReply={onReply}
                />
              )}
              <time>{formatTime(message.createdAt)}</time>
            </article>
          </Fragment>
        );
      })}
    </div>
  );
}
