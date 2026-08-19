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
  text: HomeTranslation;
  onClose: () => void;
  onPickQuestion: (question: string) => void;
};

export function QuestionSuggestions({
  text,
  onClose,
  onPickQuestion,
}: QuestionSuggestionsProps) {
  return (
    <div className="question-suggestions">
      <div className="question-suggestions__header">
        <strong>{text.questionIdeasTitle}</strong>
        <button type="button" onClick={onClose} aria-label={text.skipButton}>
          {text.skipButton}
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
    </div>
  );
}
