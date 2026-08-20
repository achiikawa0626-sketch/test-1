import type { ChatBook } from '../lib/chatBook';

type MediaBookPreviewProps = {
  book: ChatBook;
  isDownloading: boolean;
  onDownload: () => void;
};

export function MediaBookPreview({ book, isDownloading, onDownload }: MediaBookPreviewProps) {
  return (
    <article className="media-book-preview">
      <div className="media-book-cover">
        <p>{book.authorLine}</p>
        <h2>{book.title}</h2>
        <span>{book.overview}</span>
      </div>

      <button disabled={isDownloading} type="button" onClick={onDownload}>
        {isDownloading ? 'Preparing book...' : 'Download book'}
      </button>

      <div className="media-book-chapters">
        {book.chapters.map((chapter) => (
          <section className="media-book-chapter" key={chapter.title}>
            <h3>{chapter.title}</h3>
            {chapter.prose.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul>
              {chapter.sourceNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
