import type { ChatBook } from './chatBook';

type PdfDocument = import('jspdf').jsPDF;

export async function downloadChatBookPdf(book: ChatBook) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
  const page = {
    width: pdf.internal.pageSize.getWidth(),
    height: pdf.internal.pageSize.getHeight(),
    margin: 54,
  };
  const textWidth = page.width - page.margin * 2;

  drawCover(pdf, book, page);
  pdf.addPage();

  let y = page.margin;
  pdf.setFont('times', 'normal');
  pdf.setFontSize(13);
  pdf.setTextColor('#232323');

  splitParagraphs(book.body).forEach((paragraph) => {
    const lines = pdf.splitTextToSize(paragraph, textWidth) as string[];
    lines.forEach((line) => {
      if (y > page.height - page.margin) {
        drawPageNumber(pdf, page);
        pdf.addPage();
        y = page.margin;
      }

      pdf.text(line, page.margin, y);
      y += 18;
    });
    y += 10;
  });

  drawPageNumber(pdf, page);
  pdf.save(`${slugify(book.title)}.pdf`);
}

function drawCover(
  pdf: PdfDocument,
  book: ChatBook,
  page: { width: number; height: number; margin: number },
) {
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

function drawPageNumber(
  pdf: PdfDocument,
  page: { width: number; height: number; margin: number },
) {
  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor('#777777');
  pdf.text(String(pdf.getNumberOfPages()), page.width / 2, page.height - 28, { align: 'center' });
}

function splitParagraphs(text: string) {
  return text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'chat-book';
}
