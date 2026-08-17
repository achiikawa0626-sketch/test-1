const suggestedQuestions = [
  'How did you feel when you were 16?',
  'What was your childhood like?',
  'How did people live when you were young?',
  'What was school like for you?',
  'What did you do after class or work?',
  'What family tradition do you remember most?',
];

type QuestionSuggestionsProps = {
  customQuestion: string;
  onCustomQuestionChange: (question: string) => void;
  onClose: () => void;
  onPickQuestion: (question: string) => void;
};

export function QuestionSuggestions({
  customQuestion,
  onCustomQuestionChange,
  onClose,
  onPickQuestion,
}: QuestionSuggestionsProps) {
  return (
    <div className="question-suggestions">
      <div className="question-suggestions__header">
        <strong>Question ideas</strong>
        <button type="button" onClick={onClose} aria-label="Close question ideas">
          Skip
        </button>
      </div>
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
      <div className="question-suggestions__custom">
        <input
          value={customQuestion}
          onChange={(event) => onCustomQuestionChange(event.target.value)}
          placeholder="Write your own..."
        />
        <button type="button" onClick={() => onPickQuestion(customQuestion)} disabled={!customQuestion.trim()}>
          Use
        </button>
      </div>
    </div>
  );
}
