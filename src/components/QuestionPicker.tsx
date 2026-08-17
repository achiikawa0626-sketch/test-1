type QuestionPickerProps = {
  aiQuestion: string;
  isGeneratingAiQuestion: boolean;
  question: string;
  starterQuestions: string[];
  onChange: (question: string) => void;
};

export function QuestionPicker({
  aiQuestion,
  isGeneratingAiQuestion,
  question,
  starterQuestions,
  onChange,
}: QuestionPickerProps) {
  return (
    <section className="card question-picker">
      <h2>Your question</h2>
      <textarea value={question} onChange={(event) => onChange(event.target.value)} />
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
        {isGeneratingAiQuestion && (
          <div className="ai-question-loader" role="status" aria-live="polite">
            <span className="ai-question-loader__spark" />
            <span>Creating a follow-up question</span>
            <span className="ai-question-loader__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
        {aiQuestion && (
          <button
            className="ghost question-choice"
            type="button"
            onClick={() => onChange(aiQuestion)}
          >
            {aiQuestion}
          </button>
        )}
      </div>
    </section>
  );
}
