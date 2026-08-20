import type { ChatBook } from './chatBook';
import { buildBookFromText } from './storyBookBuilder';

export type TextBookInput = {
  title: string;
  grandmaName: string;
  sourceText: string;
};

export async function generateTextBook(input: TextBookInput): Promise<ChatBook> {
  const sourceText = input.sourceText.trim();
  if (sourceText.length < 40) {
    throw new Error('Paste a longer story from grandma first.');
  }

  const title = input.title.trim() || `${input.grandmaName.trim() || 'Grandma'}'s Story`;
  const grandmaName = input.grandmaName.trim() || 'Grandma';

  return buildBookFromText({
    title,
    authorLine: `A book made only from ${grandmaName}'s words`,
    sourceName: grandmaName,
    sourceText,
  });
}
