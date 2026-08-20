import { useState } from 'react';
import { Link } from 'wouter';
import { MediaBookPreview } from '../components/MediaBookPreview';
import { TextBookForm } from '../components/TextBookForm';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useAppLanguage } from '../lib/appLanguage';
import type { ChatBook } from '../lib/chatBook';
import { downloadChatBookHtml } from '../lib/chatBookHtml';
import { generateTextBook } from '../lib/textBook';
import { textBookTranslations } from '../lib/textBookTranslations';

export function MediaBookPage() {
  const [language, setLanguage] = useAppLanguage();
  const text = textBookTranslations[language];
  const [book, setBook] = useState<ChatBook>();
  const [grandmaName, setGrandmaName] = useState(text.grandmaNamePlaceholder);
  const [message, setMessage] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [title, setTitle] = useState(text.bookTitlePlaceholder);
  const [isWriting, setIsWriting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  function changeLanguage(nextLanguage: typeof language) {
    const nextText = textBookTranslations[nextLanguage];
    setTitle((currentTitle) =>
      currentTitle === text.bookTitlePlaceholder ? nextText.bookTitlePlaceholder : currentTitle,
    );
    setGrandmaName((currentName) =>
      currentName === text.grandmaNamePlaceholder ? nextText.grandmaNamePlaceholder : currentName,
    );
    setLanguage(nextLanguage);
  }

  async function createBook() {
    if (sourceText.trim().length < 40 || isWriting) return;
    setIsWriting(true);
    setMessage('');

    try {
      setBook(await generateTextBook({ grandmaName, language, sourceText, title }));
      setMessage(text.createdMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.createError);
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
        <Link href="/">{text.backButton}</Link>
        <LanguageSwitcher language={language} onChange={changeLanguage} />
        <h1>{text.pageTitle}</h1>
        <p>{text.pageIntro}</p>
      </header>

      <section className="media-book-layout">
        <div className="card">
          <h2>{text.sourceTitle}</h2>
          <TextBookForm
            grandmaName={grandmaName}
            isWriting={isWriting}
            sourceText={sourceText}
            text={text}
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
            text={text}
            onDownload={() => void downloadBook()}
          />
        ) : (
          <div className="media-book-empty">
            <h2>{text.emptyTitle}</h2>
            <p>{text.emptyText}</p>
          </div>
        )}
      </section>
    </main>
  );
}
