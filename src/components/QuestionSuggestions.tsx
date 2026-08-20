import type { HomeTranslation } from '../lib/homeTranslations';

const suggestedQuestions = [
  'How did you feel when you were 16?',
  'What was your childhood like?',
  'How did people live when you were young?',
  'What was school like for you?',
  'What did you do after class or work?',
  'What family tradition do you remember most?',
];

type QuestionSuggestionsProps = {
  followUpQuestions: string[];
  isGeneratingFollowUp: boolean;
  text: HomeTranslation;
  onClose: () => void;
  onPickQuestion: (question: string) => void;
  onRefreshFollowUp: () => void;
};

export function QuestionSuggestions({
  followUpQuestions,
  isGeneratingFollowUp,
  text,
  onClose,
  onPickQuestion,
  onRefreshFollowUp,
}: QuestionSuggestionsProps) {
  return (
    <div className="question-suggestions">
      <div className="question-suggestions__header">
        <strong>{text.questionIdeasTitle}</strong>
        <button type="button" onClick={onClose} aria-label={text.skipButton}>
          {text.skipButton}
        </button>
      </div>
      {(isGeneratingFollowUp || followUpQuestions.length > 0) && (
        <div className="question-suggestions__ai">
          <div className="question-suggestions__ai-header">
            <span>{text.followUpTitle}</span>
            <div>
              <button type="button" onClick={onRefreshFollowUp}>
                {text.refreshButton}
              </button>
            </div>
          </div>
          {isGeneratingFollowUp ? (
            <p>{text.readingLatestStory}</p>
          ) : (
            <div className="question-suggestions__row">
              {followUpQuestions.map((question) => (
                <button
                  className="question-suggestion question-suggestion--ai"
                  type="button"
                  key={question}
                  onClick={() => onPickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="question-suggestions__row">
        {suggestedQuestions.map((question) => (
          <button
            className="question-suggestion"
            type="button"
            key={question}
            onClick={() => onPickQuestion(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
