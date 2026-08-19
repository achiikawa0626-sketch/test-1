import { useEffect, useState } from 'react';
import { ChatRecorder } from './ChatRecorder';
import { QuestionSuggestions } from './QuestionSuggestions';
import type { AccountMode } from '../lib/accountMode';
import type { ChatMediaType, ChatMessage } from '../lib/chat';
import type { HomeTranslation } from '../lib/homeTranslations';

type ChatComposerProps = {
  followUpQuestion: string;
  mode: AccountMode;
  initialText: string;
  isGeneratingFollowUp: boolean;
  replyTo?: ChatMessage;
  isSending: boolean;
  text: HomeTranslation;
  onCancelReply: () => void;
  onRefreshFollowUp: () => void;
  onSendFollowUp: (text: string) => Promise<void>;
  onSendText: (text: string) => Promise<void>;
  onSendMedia: (blob: Blob, mediaType: ChatMediaType, transcript?: string) => Promise<void>;
};

export function ChatComposer({
  followUpQuestion,
  mode,
  initialText,
  isGeneratingFollowUp,
  replyTo,
  isSending,
  text,
  onCancelReply,
  onRefreshFollowUp,
  onSendFollowUp,
  onSendText,
  onSendMedia,
}: ChatComposerProps) {
  const [draft, setDraft] = useState('');
  const [isQuestionPanelOpen, setIsQuestionPanelOpen] = useState(false);
  const canAskQuestions = mode === 'kid';
  const allowedTypes: ChatMediaType[] = mode === 'kid' ? ['audio'] : ['audio', 'video'];
  const placeholder =
    mode === 'kid' ? text.askGrandmaPlaceholder : text.answerPlaceholder;

  useEffect(() => {
    if (initialText.trim()) setDraft(initialText);
  }, [initialText]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (isSending || !draft.trim()) return;
    const replyLabel = replyTo?.senderRole === 'kid' ? text.replyKidLabel : text.replyGrandmaLabel;
    const replyLine = replyTo
      ? `${text.replyingTo(replyLabel)}: "${replyTo.body || text.mediaMessageLabel}"\n\n`
      : '';
    await onSendText(`${replyLine}${draft}`);
    setDraft('');
    onCancelReply();
  }

  function pickQuestion(question: string) {
    if (!question.trim()) return;
    setDraft(question.trim());
    setIsQuestionPanelOpen(false);
  }

  async function sendFollowUp() {
    if (!followUpQuestion.trim() || isSending) return;
    await onSendFollowUp(followUpQuestion);
  }

  return (
    <section className="chat-composer">
      {replyTo && (
        <div className="chat-reply-draft">
          <p>{text.replyingTo(replyTo.senderRole === 'kid' ? text.replyKidLabel : text.replyGrandmaLabel)}</p>
          <span>{replyTo.body || text.mediaMessageLabel}</span>
          <button type="button" onClick={onCancelReply} aria-label="Cancel reply">
            ×
          </button>
        </div>
      )}
      {canAskQuestions && isQuestionPanelOpen && (
        <QuestionSuggestions
          text={text}
          onClose={() => setIsQuestionPanelOpen(false)}
          onPickQuestion={pickQuestion}
        />
      )}
      {canAskQuestions && (isGeneratingFollowUp || followUpQuestion) && (
        <div className="chat-follow-up">
          <div>
            <p>{text.followUpTitle}</p>
            <span>
              {isGeneratingFollowUp
                ? text.readingLatestStory
                : followUpQuestion}
            </span>
          </div>
          {isGeneratingFollowUp ? (
            <span className="chat-follow-up__spinner" aria-hidden="true" />
          ) : (
            <div className="chat-follow-up__actions">
              <button type="button" onClick={() => pickQuestion(followUpQuestion)}>
                {text.useButton}
              </button>
              <button type="button" onClick={() => void sendFollowUp()} disabled={isSending}>
                {text.sendButton}
              </button>
              <button type="button" onClick={onRefreshFollowUp}>
                {text.refreshButton}
              </button>
            </div>
          )}
        </div>
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
            title={text.openQuestionSuggestions}
            onClick={() => setIsQuestionPanelOpen((isOpen) => !isOpen)}
          >
            +
          </button>
        )}
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          disabled={isSending}
        />
        <button className="chat-send-button" type="submit" disabled={isSending}>
          {isSending ? text.sendingLabel : text.sendButton}
        </button>
      </form>
      <ChatRecorder
        allowedTypes={allowedTypes}
        isSending={isSending}
        text={text}
        onSend={onSendMedia}
      />
    </section>
  );
}
