import { useEffect, useState } from 'react';
import { ChatRecorder } from './ChatRecorder';
import { QuestionSuggestions } from './QuestionSuggestions';
import type { AccountMode } from '../lib/accountMode';
import type { ChatMediaType, ChatMessage } from '../lib/chat';
import type { HomeTranslation } from '../lib/homeTranslations';

type ChatComposerProps = {
  followUpQuestions: string[];
  mode: AccountMode;
  initialText: string;
  isGeneratingFollowUp: boolean;
  replyTo?: ChatMessage;
  isSending: boolean;
  text: HomeTranslation;
  onCancelReply: () => void;
  onDismissFollowUps: () => void;
  onRefreshFollowUp: () => void;
  onSendText: (text: string) => Promise<void>;
  onSendMedia: (blob: Blob, mediaType: ChatMediaType, transcript?: string) => Promise<void>;
};

export function ChatComposer({
  followUpQuestions,
  mode,
  initialText,
  isGeneratingFollowUp,
  replyTo,
  isSending,
  text,
  onCancelReply,
  onDismissFollowUps,
  onRefreshFollowUp,
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
      {canAskQuestions && (isGeneratingFollowUp || followUpQuestions.length > 0) && (
        <div className="chat-follow-up">
          <div>
            <p>{text.followUpTitle}</p>
            {isGeneratingFollowUp ? (
              <span>{text.readingLatestStory}</span>
            ) : (
              <div className="chat-follow-up__chips">
                {followUpQuestions.map((question) => (
                  <button type="button" key={question} onClick={() => pickQuestion(question)}>
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isGeneratingFollowUp ? (
            <span className="chat-follow-up__spinner" aria-hidden="true" />
          ) : (
            <div className="chat-follow-up__actions">
              <button type="button" onClick={onRefreshFollowUp}>
                {text.refreshButton}
              </button>
              <button type="button" onClick={onDismissFollowUps}>
                {text.skipButton}
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
