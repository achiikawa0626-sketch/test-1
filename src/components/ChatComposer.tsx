import { useEffect, useState } from 'react';
import { ChatRecorder } from './ChatRecorder';
import { QuestionSuggestions } from './QuestionSuggestions';
import type { AccountMode } from '../lib/accountMode';
import type { ChatMediaType, ChatMessage } from '../lib/chat';

type ChatComposerProps = {
  mode: AccountMode;
  initialText: string;
  replyTo?: ChatMessage;
  isSending: boolean;
  onCancelReply: () => void;
  onSendText: (text: string) => Promise<void>;
  onSendMedia: (blob: Blob, mediaType: ChatMediaType) => Promise<void>;
};

export function ChatComposer({
  mode,
  initialText,
  replyTo,
  isSending,
  onCancelReply,
  onSendText,
  onSendMedia,
}: ChatComposerProps) {
  const [text, setText] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(false);
  const canAskQuestions = mode === 'kid';
  const allowedTypes: ChatMediaType[] = mode === 'kid' ? ['audio'] : ['audio', 'video'];
  const placeholder =
    mode === 'kid' ? 'Ask grandma something...' : 'Write an answer or record your voice...';

  useEffect(() => {
    if (initialText.trim()) setText(initialText);
  }, [initialText]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (isSending || !text.trim()) return;
    const replyLabel = replyTo?.senderRole === 'kid' ? 'Kid' : 'Grandma';
    const replyLine = replyTo ? `Reply to ${replyLabel}: "${replyTo.body || 'media'}"\n\n` : '';
    await onSendText(`${replyLine}${text}`);
    setText('');
    onCancelReply();
  }

  function pickQuestion(question: string) {
    if (!question.trim()) return;
    setText(question.trim());
    setCustomQuestion('');
    setIsQuestionPanelOpen(false);
  }

  return (
    <section className="chat-composer">
      {replyTo && (
        <div className="chat-reply-draft">
          <p>Replying to {replyTo.senderRole === 'kid' ? 'Kid' : 'Grandma'}</p>
          <span>{replyTo.body || 'Media message'}</span>
          <button type="button" onClick={onCancelReply} aria-label="Cancel reply">
            ×
          </button>
        </div>
      )}
      {canAskQuestions && isQuestionPanelOpen && (
        <QuestionSuggestions
          customQuestion={customQuestion}
          onCustomQuestionChange={setCustomQuestion}
          onPickQuestion={pickQuestion}
        />
      )}
      <form
        className={canAskQuestions ? 'chat-compose-row' : 'chat-compose-row no-plus'}
        onSubmit={submit}
      >
        {canAskQuestions && (
          <button
            className="chat-plus-button"
            type="button"
            aria-label="Open question suggestions"
            title="Open question suggestions"
            onClick={() => setIsQuestionPanelOpen((isOpen) => !isOpen)}
          >
            +
          </button>
        )}
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          disabled={isSending}
        />
        <button className="chat-send-button" type="submit" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
      <ChatRecorder allowedTypes={allowedTypes} isSending={isSending} onSend={onSendMedia} />
    </section>
  );
}
