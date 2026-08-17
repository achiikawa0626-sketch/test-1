import { supabase } from './supabase';

export type ChatStreak = {
  currentStreak: number;
  bestStreak: number;
  lastChatDate?: string;
};

type ChatStreakRow = {
  current_streak: number;
  best_streak: number;
  last_chat_date: string | null;
};

const emptyStreak: ChatStreak = {
  currentStreak: 0,
  bestStreak: 0,
};

export async function loadChatStreak() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return emptyStreak;

  const { data, error } = await supabase
    .from('chat_streaks')
    .select('current_streak, best_streak, last_chat_date')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (error) return emptyStreak;
  return data ? toStreak(data as ChatStreakRow) : emptyStreak;
}

export async function recordChatStreak() {
  const { data, error } = await supabase.rpc('record_chat_streak');
  if (error) return emptyStreak;

  const row = Array.isArray(data) ? data[0] : data;
  return row ? toStreak(row as ChatStreakRow) : emptyStreak;
}

function toStreak(row: ChatStreakRow): ChatStreak {
  return {
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    lastChatDate: row.last_chat_date ?? undefined,
  };
}
