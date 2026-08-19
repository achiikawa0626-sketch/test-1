import type { ChatBook, ChatBookChapter } from './chatBook';

type PdfDocument = import('jspdf').jsPDF;
type PageBox = { width: number; height: number; margin: number };

export async function downloadChatBookPdf(book: ChatBook) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
  const page = {
    width: pdf.internal.pageSize.getWidth(),
    height: pdf.internal.pageSize.getHeight(),
    margin: 54,
  };

  drawCover(pdf, book, page);
  pdf.addPage();

  let y = page.margin;
  y = drawSection(pdf, page, y, 'Story Overview', [book.overview]);
  book.chapters.forEach((chapter) => {
    y = drawChapter(pdf, page, y, chapter);
  });

  drawPageNumber(pdf, page);
  pdf.save(`${slugify(book.title)}.pdf`);
}

function drawChapter(pdf: PdfDocument, page: PageBox, y: number, chapter: ChatBookChapter) {
  let nextY = drawSection(pdf, page, y, chapter.title, chapter.prose);
  nextY = drawSection(pdf, page, nextY, 'Audio and Video References', readableList(chapter.mediaReferences));
  return drawSection(pdf, page, nextY, 'Source Notes', readableList(chapter.sourceNotes));
}

function drawSection(
  pdf: PdfDocument,
  page: PageBox,
  y: number,
  heading: string,
  paragraphs: string[],
) {
  let nextY = ensureRoom(pdf, page, y, 54);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor('#7a4d76');
  pdf.text(heading, page.margin, nextY);
  nextY += 24;

  pdf.setFont('times', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor('#232323');

  paragraphs.forEach((paragraph) => {
    nextY = drawParagraph(pdf, page, nextY, paragraph);
  });

  return nextY + 8;
}

function drawParagraph(pdf: PdfDocument, page: PageBox, y: number, paragraph: string) {
  const textWidth = page.width - page.margin * 2;
  const lines = pdf.splitTextToSize(paragraph, textWidth) as string[];
  let nextY = y;

  lines.forEach((line) => {
    nextY = ensureRoom(pdf, page, nextY, 18);
    pdf.text(line, page.margin, nextY);
    nextY += 17;
  });

  return nextY + 5;
}

function ensureRoom(pdf: PdfDocument, page: PageBox, y: number, needed: number) {
  if (y + needed <= page.height - page.margin) return y;

  drawPageNumber(pdf, page);
  pdf.addPage();
  return page.margin;
}

function readableList(items: string[]) {
  return items.length > 0 ? items.map((item) => `- ${item}`) : ['- None found in this chapter.'];
}

function drawCover(pdf: PdfDocument, book: ChatBook, page: PageBox) {
  pdf.setFillColor('#fff7ec');
  pdf.rect(0, 0, page.width, page.height, 'F');
  pdf.setDrawColor('#7a4d76');
  pdf.setLineWidth(2);
  pdf.rect(page.margin, page.margin, page.width - page.margin * 2, page.height - page.margin * 2);

  pdf.setFont('times', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor('#7a4d76');
  const titleLines = pdf.splitTextToSize(book.title, page.width - page.margin * 2 - 40) as string[];
  pdf.text(titleLines, page.width / 2, 210, { align: 'center' });

  pdf.setFont('times', 'italic');
  pdf.setFontSize(14);
  pdf.setTextColor('#5b5b5b');
  pdf.text(book.authorLine, page.width / 2, 320, { align: 'center' });

  pdf.setFont('times', 'normal');
  pdf.setFontSize(11);
  pdf.text('Created from a real AskGrandma chat', page.width / 2, page.height - 110, {
    align: 'center',
  });
}

function drawPageNumber(pdf: PdfDocument, page: PageBox) {
  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor('#777777');
  pdf.text(String(pdf.getNumberOfPages()), page.width / 2, page.height - 28, { align: 'center' });
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'chat-book';
}
