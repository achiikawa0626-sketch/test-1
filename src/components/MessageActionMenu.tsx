import { useState } from 'react';
import type { ChatMessage } from '../lib/chat';

type MessageActionMenuProps = {
  message: ChatMessage;
  onClose: () => void;
  onCopy: (text: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onFavorite: (message: ChatMessage) => Promise<void>;
  onForward: (message: ChatMessage) => Promise<void>;
  onPin: (message: ChatMessage, duration: string) => Promise<void>;
  onReact: (messageId: string, reaction: string) => Promise<void>;
  onReply: (message: ChatMessage) => void;
  onReport: (message: ChatMessage) => Promise<void>;
};

export function MessageActionMenu({
  message,
  onClose,
  onCopy,
  onDelete,
  onFavorite,
  onForward,
  onPin,
  onReact,
  onReply,
  onReport,
}: MessageActionMenuProps) {
  const [isPinPanelOpen, setIsPinPanelOpen] = useState(false);
  const [pinDuration, setPinDuration] = useState('7 days');
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  const pinOptions = ['24 hours', '7 days', '30 days'];

  async function run(action: () => Promise<void>) {
    await action();
    onClose();
  }

  return (
    <div className="message-menu">
      <div className="message-menu__reactions" aria-label="Message reactions">
        {reactions.map((reaction) => (
          <button
            type="button"
            key={reaction}
            onClick={() => void run(() => onReact(message.id, reaction))}
          >
            {reaction}
          </button>
        ))}
        <button type="button" onClick={onClose} aria-label="More reactions">
          +
        </button>
      </div>

      <div className="message-menu__panel">
        <button
          type="button"
          onClick={() => {
            onReply(message);
            onClose();
          }}
        >
          <span>↩</span>
          Reply
        </button>
        {message.body && (
          <button type="button" onClick={() => void run(() => onCopy(message.body))}>
            <span>▣</span>
            Copy
          </button>
        )}
        <button type="button" onClick={() => void run(() => onReact(message.id, '👍'))}>
          <span>☺</span>
          React
        </button>
        <button type="button" onClick={() => void run(() => onForward(message))}>
          <span>↠</span>
          Forward
        </button>
        <button type="button" onClick={() => setIsPinPanelOpen(true)}>
          <span>📌</span>
          Pin
        </button>
        <button type="button" onClick={() => void run(() => onFavorite(message))}>
          <span>☆</span>
          Favorite
        </button>
        <button
          className="message-menu__danger"
          type="button"
          onClick={() => void run(() => onReport(message))}
        >
          <span>⚐</span>
          Report
        </button>
        {message.isMine && (
          <button
            className="message-menu__danger"
            type="button"
            onClick={() => void run(() => onDelete(message.id))}
          >
            <span>⌫</span>
            Delete
          </button>
        )}
      </div>
      {isPinPanelOpen && (
        <div className="pin-panel" role="dialog" aria-label="Choose pin duration">
          <h3>Choose how long your pin lasts</h3>
          <p>You can unpin at any time.</p>
          <div className="pin-panel__options">
            {pinOptions.map((option) => (
              <label key={option}>
                <input
                  checked={pinDuration === option}
                  name={`pin-${message.id}`}
                  type="radio"
                  onChange={() => setPinDuration(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <div className="pin-panel__actions">
            <button type="button" onClick={() => setIsPinPanelOpen(false)}>
              Cancel
            </button>
            <button type="button" onClick={() => void run(() => onPin(message, pinDuration))}>
              Pin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
