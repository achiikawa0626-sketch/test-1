export type AiBookDraft = {
  overview: string;
  chapters: Array<{
    title: string;
    prose: string[];
    sourceNotes: string[];
  }>;
};

export function parseAiBookDraft(value: string): AiBookDraft {
  const parsed = JSON.parse(extractJson(value)) as unknown;
  if (!isDraft(parsed)) throw new Error('AI storybook response had the wrong shape.');
  return parsed;
}

function extractJson(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  return (fenced ?? value).trim();
}

function isDraft(value: unknown): value is AiBookDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<AiBookDraft>;
  return (
    typeof draft.overview === 'string' &&
    Array.isArray(draft.chapters) &&
    draft.chapters.every((chapter) => {
      const item = chapter as Partial<AiBookDraft['chapters'][number]>;
      return (
        typeof item.title === 'string' &&
        Array.isArray(item.prose) &&
        Array.isArray(item.sourceNotes) &&
        item.prose.every((paragraph) => typeof paragraph === 'string') &&
        item.sourceNotes.every((note) => typeof note === 'string')
      );
    })
  );
}
