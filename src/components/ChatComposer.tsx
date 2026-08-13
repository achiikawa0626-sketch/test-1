import { useState } from 'react';
import { ChatRecorder } from './ChatRecorder';
import { QuestionSuggestions } from './QuestionSuggestions';
import type { AccountMode } from '../lib/accountMode';
import type { ChatMediaType } from '../lib/chat';

type ChatComposerProps = {
  mode: AccountMode;
  onSendText: (text: string) => Promise<void>;
  onSendMedia: (blob: Blob, mediaType: ChatMediaType) => Promise<void>;
};

export function ChatComposer({ mode, onSendText, onSendMedia }: ChatComposerProps) {
  const [text, setText] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(false);
  const canAskQuestions = mode === 'kid';
  const allowedTypes: ChatMediaType[] = mode === 'kid' ? ['video'] : ['audio', 'video'];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    await onSendText(text);
    setText('');
  }

  function pickQuestion(question: string) {
    if (!question.trim()) return;
    setText(question.trim());
    setCustomQuestion('');
    setIsQuestionPanelOpen(false);
  }

  return (
    <section className="chat-composer">
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
          placeholder="Message"
        />
        <button className="chat-send-button" type="submit">Send</button>
      </form>
      <ChatRecorder allowedTypes={allowedTypes} onSend={onSendMedia} />
    </section>
  );
}
