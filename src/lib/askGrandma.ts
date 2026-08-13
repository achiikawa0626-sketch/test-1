import { supabase } from './supabase';

export type FamilyRole = 'grandma' | 'grandpa' | 'mom' | 'dad' | 'me';

export type MemoryTopic =
  | 'Grandma at My Age'
  | 'Childhood'
  | 'Love and Family'
  | 'Hard Choices'
  | 'Advice for Me'
  | 'Traditions';

export type FamilyMember = {
  id: string;
  name: string;
  role: FamilyRole;
  birthYear?: number;
};

export type Memory = {
  id: string;
  memberId: string;
  questionId: string;
  question: string;
  topic: MemoryTopic;
  answer: string;
  createdAt: string;
};

type FamilyMemberRow = {
  id: string;
  name: string;
  role: FamilyRole;
  birth_year: number | null;
};

type MemoryRow = {
  id: string;
  family_member_id: string;
  question_id: string;
  answer_text: string | null;
  topic: MemoryTopic;
  created_at: string;
  questions: { question: string } | { question: string }[] | null;
};

export const roleLabels: Record<FamilyRole, string> = {
  grandma: 'Grandma',
  grandpa: 'Grandpa',
  mom: 'Mom',
  dad: 'Dad',
  me: 'Me',
};

export const memoryTopics: MemoryTopic[] = [
  'Grandma at My Age',
  'Childhood',
  'Love and Family',
  'Hard Choices',
  'Advice for Me',
  'Traditions',
];

export async function loadFamilyMembers() {
  const { data, error } = await supabase
    .from('family_members')
    .select('id, name, role, birth_year')
    .order('created_at', { ascending: false });

  if (error) throw friendlyDatabaseError(error.message);

  return ((data ?? []) as FamilyMemberRow[]).map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    birthYear: member.birth_year ?? undefined,
  }));
}

export async function createFamilyMember(member: {
  name: string;
  role: FamilyRole;
  birthYear?: number;
}) {
  const { error } = await supabase.from('family_members').insert({
    name: member.name,
    role: member.role,
    birth_year: member.birthYear,
  });

  if (error) throw friendlyDatabaseError(error.message);
}

export async function createQuestionMemory(input: {
  memberId: string;
  question: string;
  topic: MemoryTopic;
}) {
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .insert({
      family_member_id: input.memberId,
      question: input.question,
      topic: input.topic,
    })
    .select('id')
    .single();

  if (questionError) throw friendlyDatabaseError(questionError.message);

  const { data: memory, error: memoryError } = await supabase
    .from('memories')
    .insert({
      family_member_id: input.memberId,
      question_id: question.id,
      topic: input.topic,
      answer_text: '',
    })
    .select('id')
    .single();

  if (memoryError) throw friendlyDatabaseError(memoryError.message);
  return memory.id as string;
}

export async function loadMemories() {
  const { data, error } = await supabase
    .from('memories')
    .select('id, family_member_id, question_id, answer_text, topic, created_at, questions(question)')
    .order('created_at', { ascending: false });

  if (error) throw friendlyDatabaseError(error.message);

  return ((data ?? []) as MemoryRow[]).map((memory) => ({
    id: memory.id,
    memberId: memory.family_member_id,
    questionId: memory.question_id,
    question: readQuestionText(memory.questions),
    topic: memory.topic,
    answer: memory.answer_text ?? '',
    createdAt: memory.created_at,
  }));
}

function readQuestionText(question: MemoryRow['questions']) {
  if (Array.isArray(question)) {
    return question[0]?.question ?? 'Saved question';
  }

  return question?.question ?? 'Saved question';
}

export async function loadMemory(memoryId: string) {
  const memories = await loadMemories();
  return memories.find((memory) => memory.id === memoryId);
}

export async function updateMemoryAnswer(memoryId: string, answer: string) {
  const { error } = await supabase
    .from('memories')
    .update({ answer_text: answer })
    .eq('id', memoryId);

  if (error) throw friendlyDatabaseError(error.message);
}

function friendlyDatabaseError(message: string) {
  if (message.toLowerCase().includes('could not find the table')) {
    return new Error('Supabase tables are missing. Run npm run db:push -- --yes first.');
  }

  return new Error(message);
}
