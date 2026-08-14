import { useState } from 'react';
import { ChatRecorder } from './ChatRecorder';
import { QuestionSuggestions } from './QuestionSuggestions';
import { generateFollowUpQuestions } from '../lib/aiQuestions';
import type { AccountMode } from '../lib/accountMode';
import type { ChatMediaType } from '../lib/chat';

type ChatComposerProps = {
  mode: AccountMode;
  storyText: string;
  onSendText: (text: string) => Promise<void>;
  onSendMedia: (blob: Blob, mediaType: ChatMediaType) => Promise<void>;
};

export function ChatComposer({ mode, storyText, onSendText, onSendMedia }: ChatComposerProps) {
  const [text, setText] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(false);
  const canAskQuestions = mode === 'kid';
  const allowedTypes: ChatMediaType[] = mode === 'kid' ? ['video'] : ['audio'];

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

  async function generateQuestions() {
    setIsGeneratingQuestions(true);
    setAiMessage('');

    try {
      const questions = await generateFollowUpQuestions(storyText);
      setAiQuestions(questions);
      if (questions.length === 0) setAiMessage('AI did not find a question yet. Try after more chat.');
    } catch (error) {
      setAiMessage(error instanceof Error ? error.message : 'Could not create AI questions.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  }

  return (
    <section className="chat-composer">
      {canAskQuestions && isQuestionPanelOpen && (
        <QuestionSuggestions
          aiMessage={aiMessage}
          aiQuestions={aiQuestions}
          customQuestion={customQuestion}
          isGeneratingQuestions={isGeneratingQuestions}
          onGenerateQuestions={() => void generateQuestions()}
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
