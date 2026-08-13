import type { ChatMessage } from '../lib/chat';

type ChatMessagesProps = {
  messages: ChatMessage[];
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ChatMessages({ messages }: ChatMessagesProps) {
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
          <time>{formatTime(message.createdAt)}</time>
        </article>
      ))}
    </div>
  );
}
