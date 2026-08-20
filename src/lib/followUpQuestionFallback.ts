export const starterFollowUps = [
  'What happened after that?',
  'How did you feel in that moment?',
  'What do you remember most clearly about that day?',
  'Who was there with you?',
  'Why did it matter to you?',
];

export function fallbackQuestions(text: string, refreshSeed = 0) {
  const questions = safeFallbackQuestions(text);
  const offset = questions.length > 0 ? refreshSeed % questions.length : 0;
  const rotatedQuestions = [...questions.slice(offset), ...questions.slice(0, offset)];

  return rotatedQuestions
    .filter((question, index, items) => items.indexOf(question) === index)
    .slice(0, 5);
}

export function cleanQuestions(text: string) {
  const parsedQuestions = parseQuestionList(text);
  const questions = parsedQuestions.length > 0 ? parsedQuestions : text.split(/\n+/);

  return questions
    .map((question) => cleanQuestion(question.replace(/^[-*\d. )]+/, '')))
    .filter(Boolean)
    .slice(0, 5);
}

export function isGenericQuestion(question: string) {
  const normalizedQuestion = question.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  return [
    'what happened after that',
    'how did you feel in that moment',
    'what do you remember most clearly about that day',
  ].includes(normalizedQuestion);
}

function safeFallbackQuestions(text: string) {
  const lowerText = text.toLowerCase();

  if (hasAny(lowerText, ['игруш', 'toy'])) {
    return [
      hasAny(lowerText, ['потер', 'lost']) ? 'Где ты потеряла игрушки?' : 'Какие игрушки ты любила?',
      'С кем ты играла?',
      'Почему они были любимыми?',
      'Что ты помнишь об игре?',
      hasAny(lowerText, ['потер', 'lost']) ? 'Кто помогал их искать?' : 'Как они выглядели?',
      hasAny(lowerText, ['потер', 'lost']) ? 'Как ты себя чувствовала?' : 'Где ты с ними играла?',
    ];
  }
  if (hasAny(lowerText, ['играл', 'играла', 'play'])) {
    return ['Во что ты играла?', 'С кем ты играла?', 'Где вы обычно играли?', 'Почему тебе это нравилось?', 'Что было самым весёлым?'];
  }
  if (hasAny(lowerText, ['плак', 'рыда', 'cry'])) {
    return ['Кто тебя тогда утешил?', 'Что помогло тебе успокоиться?', 'Как ты это пережила?', 'Кому ты рассказала об этом?', 'Что стало потом легче?'];
  }
  if (hasAny(lowerText, ['7 лет', 'seven', '7 year'])) {
    return ['Какой ты была в семь?', 'Что ты любила тогда?', 'Кто был рядом с тобой?', 'Где ты тогда жила?', 'Что ты часто делала?'];
  }
  if (lowerText.includes('birthday')) {
    return ['What else happened on that birthday?', 'How did you feel that day?', 'Who was with you?'];
  }
  if (lowerText.includes('father')) {
    return ['What do you remember about your father that day?', 'How did he make you feel?', 'What happened next?'];
  }
  if (lowerText.includes('mother')) {
    return ['What do you remember about your mother that day?', 'How did she make you feel?', 'What happened next?'];
  }
  if (lowerText.includes('school')) {
    return ['What was school like for you then?', 'Who was your favorite teacher?', 'What did you do after school?'];
  }

  return starterFollowUps;
}

function cleanQuestion(text: string) {
  return text.replace(/^["']|["']$/g, '').trim().slice(0, 180);
}

function parseQuestionList(text: string) {
  try {
    const json = JSON.parse(extractJson(text)) as unknown;
    if (!json || typeof json !== 'object') return [];
    const questions = (json as { questions?: unknown }).questions;
    return Array.isArray(questions)
      ? questions.filter((question): question is string => typeof question === 'string')
      : [];
  } catch {
    return [];
  }
}

function extractJson(text: string) {
  return text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text.trim();
}

function hasAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle));
}
