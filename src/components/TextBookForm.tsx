import type { FormEvent } from 'react';

type TextBookFormProps = {
  grandmaName: string;
  isWriting: boolean;
  sourceText: string;
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
        Book title
        <input
          value={title}
          placeholder="Grandma's Story"
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </label>

      <label>
        Grandma name
        <input
          value={grandmaName}
          placeholder="Grandma"
          onChange={(event) => onGrandmaNameChange(event.target.value)}
        />
      </label>

      <label>
        Grandma's text
        <textarea
          className="text-book-source"
          value={sourceText}
          placeholder="Paste exactly what grandma wrote here."
          onChange={(event) => onSourceTextChange(event.target.value)}
        />
      </label>

      <button disabled={sourceText.trim().length < 40 || isWriting} type="submit">
        {isWriting ? 'Writing book...' : 'Create book'}
      </button>
    </form>
  );
}
