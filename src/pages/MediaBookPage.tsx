import { useState } from 'react';
import { Link } from 'wouter';
import { MediaBookPreview } from '../components/MediaBookPreview';
import { TextBookForm } from '../components/TextBookForm';
import type { ChatBook } from '../lib/chatBook';
import { downloadChatBookHtml } from '../lib/chatBookHtml';
import { generateTextBook } from '../lib/textBook';

export function MediaBookPage() {
  const [book, setBook] = useState<ChatBook>();
  const [grandmaName, setGrandmaName] = useState('Grandma');
  const [message, setMessage] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [title, setTitle] = useState("Grandma's Story");
  const [isWriting, setIsWriting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  async function createBook() {
    if (sourceText.trim().length < 40 || isWriting) return;
    setIsWriting(true);
    setMessage('');

    try {
      setBook(await generateTextBook({ grandmaName, sourceText, title }));
      setMessage("Book created from grandma's text.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create the book.');
    } finally {
      setIsWriting(false);
    }
  }

  async function downloadBook() {
    if (!book || isDownloading) return;
    setIsDownloading(true);

    try {
      downloadChatBookHtml(book);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="wide-container media-book-page">
      <header className="page-header">
        <Link href="/">Back</Link>
        <h1>Turn grandma's text into a book</h1>
        <p>Paste what she wrote. The book will stay faithful to those words and details.</p>
      </header>

      <section className="media-book-layout">
        <div className="card">
          <h2>Source text</h2>
          <TextBookForm
            grandmaName={grandmaName}
            isWriting={isWriting}
            sourceText={sourceText}
            title={title}
            onGrandmaNameChange={setGrandmaName}
            onSourceTextChange={setSourceText}
            onSubmit={() => void createBook()}
            onTitleChange={setTitle}
          />
          {message && <p className="message">{message}</p>}
        </div>

        {book ? (
          <MediaBookPreview
            book={book}
            isDownloading={isDownloading}
            onDownload={() => void downloadBook()}
          />
        ) : (
          <div className="media-book-empty">
            <h2>Your book will appear here</h2>
            <p>The first draft will include chapters, story paragraphs, and source notes.</p>
          </div>
        )}
      </section>
    </main>
  );
}
