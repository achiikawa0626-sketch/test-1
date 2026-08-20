import type { FormEvent } from 'react';
import type { TextBookTranslation } from '../lib/textBookTranslations';

type TextBookFormProps = {
  grandmaName: string;
  isWriting: boolean;
  sourceText: string;
  text: TextBookTranslation;
  title: string;
  onGrandmaNameChange: (name: string) => void;
  onSourceTextChange: (text: string) => void;
  onSubmit: () => void;
  onTitleChange: (title: string) => void;
};

export function TextBookForm({
  grandmaName,
  isWriting,
  sourceText,
  text,
  title,
  onGrandmaNameChange,
  onSourceTextChange,
  onSubmit,
  onTitleChange,
}: TextBookFormProps) {
  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="media-book-form" onSubmit={submitForm}>
      <label>
        {text.bookTitleLabel}
        <input
          value={title}
          placeholder={text.bookTitlePlaceholder}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </label>

      <label>
        {text.grandmaNameLabel}
        <input
          value={grandmaName}
          placeholder={text.grandmaNamePlaceholder}
          onChange={(event) => onGrandmaNameChange(event.target.value)}
        />
      </label>

      <label>
        {text.grandmaTextLabel}
        <textarea
          className="text-book-source"
          value={sourceText}
          placeholder={text.grandmaTextPlaceholder}
          onChange={(event) => onSourceTextChange(event.target.value)}
        />
      </label>

      <button disabled={sourceText.trim().length < 40 || isWriting} type="submit">
        {isWriting ? text.writingButton : text.createButton}
      </button>
    </form>
  );
}
