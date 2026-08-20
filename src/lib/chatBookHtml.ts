import type { ChatBook } from './chatBook';

export function downloadChatBookHtml(book: ChatBook) {
  const html = renderBookHtml(book);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${slugify(book.title)}.html`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderBookHtml(book: ChatBook) {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${escapeHtml(book.title)}</title>`,
    '<style>',
    'body{margin:0;background:#f5f1e8;color:#25211d;font-family:Georgia,serif;line-height:1.65}',
    '.book{max-width:760px;margin:0 auto;padding:40px 22px 70px}',
    '.cover{min-height:70vh;display:grid;align-content:center;gap:18px;border:2px solid #7a4d76;padding:42px;background:#fffaf1;text-align:center}',
    '.cover h1{font-size:46px;line-height:1.05;margin:0;color:#7a4d76}',
    '.cover p{margin:0;color:#6b6259;font-family:Arial,sans-serif;font-weight:700}',
    '.overview{font-size:20px;color:#3a332d}',
    'section{padding:34px 0;border-top:1px solid #ded5c7}',
    'h2{margin:0 0 16px;color:#7a4d76;font-size:30px;line-height:1.15}',
    'p{font-size:19px;margin:0 0 16px}',
    '.notes{margin-top:18px;padding:14px 18px;background:#fff;border-radius:8px;font-family:Arial,sans-serif;color:#625b55}',
    '.notes strong{display:block;margin-bottom:6px;color:#7a4d76}',
    'li{margin-bottom:5px}',
    '@media print{body{background:#fff}.book{max-width:none}.cover{break-after:page}}',
    '</style>',
    '</head>',
    '<body>',
    '<main class="book">',
    '<div class="cover">',
    `<p>${escapeHtml(book.authorLine)}</p>`,
    `<h1>${escapeHtml(book.title)}</h1>`,
    `<p class="overview">${escapeHtml(book.overview)}</p>`,
    '</div>',
    ...book.chapters.map(renderChapter),
    '</main>',
    '</body>',
    '</html>',
  ].join('');
}

function renderChapter(chapter: ChatBook['chapters'][number]) {
  return [
    '<section>',
    `<h2>${escapeHtml(chapter.title)}</h2>`,
    ...chapter.prose.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    '<div class="notes">',
    '<strong>Source notes</strong>',
    '<ul>',
    ...chapter.sourceNotes.map((note) => `<li>${escapeHtml(note)}</li>`),
    '</ul>',
    '</div>',
    '</section>',
  ].join('');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'chat-book';
}
