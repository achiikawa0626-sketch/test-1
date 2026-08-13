const suggestedQuestions = [
  'How did you feel when you were 16?',
  'What was your childhood like?',
  'How did people live when you were young?',
  'What was school like for you?',
  'What did you do after class or work?',
  'What family tradition do you remember most?',
];

type QuestionSuggestionsProps = {
  aiMessage: string;
  aiQuestions: string[];
  customQuestion: string;
  isGeneratingQuestions: boolean;
  onGenerateQuestions: () => void;
  onCustomQuestionChange: (question: string) => void;
  onPickQuestion: (question: string) => void;
};

export function QuestionSuggestions({
  aiMessage,
  aiQuestions,
  customQuestion,
  isGeneratingQuestions,
  onGenerateQuestions,
  onCustomQuestionChange,
  onPickQuestion,
}: QuestionSuggestionsProps) {
  return (
    <div className="question-suggestions">
      <div className="question-suggestions__header">
        <strong>Question ideas</strong>
        <button
          className="chat-icon-button"
          type="button"
          onClick={onGenerateQuestions}
          disabled={isGeneratingQuestions}
        >
          {isGeneratingQuestions ? 'Thinking...' : 'AI follow-ups'}
        </button>
      </div>
      {aiMessage && <p className="question-suggestions__message">{aiMessage}</p>}
      {aiQuestions.length > 0 && (
        <div className="question-suggestions__grid">
          {aiQuestions.map((question) => (
            <button
              className="question-suggestion ai"
              type="button"
              key={question}
              onClick={() => onPickQuestion(question)}
            >
              {question}
            </button>
          ))}
        </div>
      )}
      <div className="question-suggestions__grid">
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
      <textarea
        value={customQuestion}
        onChange={(event) => onCustomQuestionChange(event.target.value)}
        placeholder="Write your own question..."
      />
      <button
        className="chat-send-button"
        type="button"
        onClick={() => onPickQuestion(customQuestion)}
        disabled={!customQuestion.trim()}
      >
        Use question
      </button>
    </div>
  );
}
