type QuestionPickerProps = {
  aiQuestion: string;
  canGenerateAiQuestion: boolean;
  isGeneratingAiQuestion: boolean;
  question: string;
  starterQuestions: string[];
  onChange: (question: string) => void;
  onGenerateAiQuestion: () => void;
};

export function QuestionPicker({
  aiQuestion,
  canGenerateAiQuestion,
  isGeneratingAiQuestion,
  question,
  starterQuestions,
  onChange,
  onGenerateAiQuestion,
}: QuestionPickerProps) {
  return (
    <section className="card question-picker">
      <h2>Your question</h2>
      <textarea value={question} onChange={(event) => onChange(event.target.value)} />
      <div className="question-picker__section">
        <div className="question-picker__heading">
          <h3>Follow-up from the latest story</h3>
          <button
            className="text-button"
            type="button"
            onClick={onGenerateAiQuestion}
            disabled={!canGenerateAiQuestion || isGeneratingAiQuestion}
          >
            {aiQuestion ? 'Refresh follow-up' : 'Make follow-up'}
          </button>
        </div>
        {isGeneratingAiQuestion ? (
          <div className="ai-question-loader" role="status" aria-live="polite">
            <span className="ai-question-loader__spark" />
            <span>Reading the latest story</span>
            <span className="ai-question-loader__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : aiQuestion ? (
          <button
            className="ai-question-button"
            type="button"
            onClick={() => onChange(aiQuestion)}
          >
            {aiQuestion}
          </button>
        ) : (
          <p className="ai-question-empty">
            After grandma or grandpa answers in chat, AI will suggest one question to keep the
            story going.
          </p>
        )}
      </div>
      <div className="question-picker__section">
        <h3>Prepared questions</h3>
        <div className="journey-card__questions">
          {starterQuestions.map((item) => (
            <button
              className="ghost question-choice"
              type="button"
              key={item}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
