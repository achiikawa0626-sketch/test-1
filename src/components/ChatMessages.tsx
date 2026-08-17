import type { ChatMessage } from '../lib/chat';

type ChatMessagesProps = {
  messages: ChatMessage[];
  translatedMessage?: { id: string; text: string };
  onCopy: (text: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onTranslate: (message: ChatMessage) => Promise<void>;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ChatMessages({
  messages,
  translatedMessage,
  onCopy,
  onDelete,
  onTranslate,
}: ChatMessagesProps) {
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
      {messages.map((message) => (
        <article className={`chat-bubble ${message.senderRole}`} key={message.id}>
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
          {translatedMessage?.id === message.id && (
            <p className="chat-bubble__translation">{translatedMessage.text}</p>
          )}
          <div className="chat-bubble__actions">
            {message.body && (
              <>
                <button type="button" onClick={() => void onCopy(message.body)}>
                  Copy
                </button>
                <button type="button" onClick={() => void onTranslate(message)}>
                  Translate
                </button>
              </>
            )}
            {message.isMine && (
              <button type="button" onClick={() => void onDelete(message.id)}>
                Delete
              </button>
            )}
          </div>
          <time>{formatTime(message.createdAt)}</time>
        </article>
      ))}
    </div>
  );
}
