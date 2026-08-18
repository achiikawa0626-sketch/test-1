import { ensureProfile } from './familyConnections';
import { supabase } from './supabase';

const localReactionKey = 'ask-grandma-direct-chat-reactions';
let hasSyncedLocalReactions = false;

export type DirectChatReaction = {
  userId: string;
  reaction: string;
};

type DirectChatReactionRow = {
  message_id: string;
  user_id: string;
  reaction: string;
};

export async function loadDirectChatReactions(messageIds: string[]) {
  if (messageIds.length === 0) return {};
  await syncSavedLocalReactions(messageIds);

  const { data, error } = await supabase
    .from('direct_chat_reactions')
    .select('message_id, user_id, reaction')
    .in('message_id', messageIds)
    .order('updated_at', { ascending: true });

  if (error) throw friendlyReactionError(error.message);
  return groupReactions((data ?? []) as DirectChatReactionRow[]);
}

export async function saveDirectChatReaction(messageId: string, reaction: string) {
  const userId = await ensureProfile();
  const { error } = await supabase.from('direct_chat_reactions').upsert(
    {
      message_id: messageId,
      user_id: userId,
      reaction,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'message_id,user_id' },
  );

  if (error) throw friendlyReactionError(error.message);
}

function groupReactions(rows: DirectChatReactionRow[]) {
  return rows.reduce<Record<string, DirectChatReaction[]>>((reactions, row) => {
    reactions[row.message_id] = [
      ...(reactions[row.message_id] ?? []),
      { userId: row.user_id, reaction: row.reaction },
    ];
    return reactions;
  }, {});
}

async function syncSavedLocalReactions(messageIds: string[]) {
  if (hasSyncedLocalReactions) return;
  hasSyncedLocalReactions = true;

  const savedReactions = readSavedLocalReactions();
  const rows = messageIds.flatMap((messageId) => {
    const reaction = savedReactions[messageId];
    if (!reaction) return [];

    return {
      message_id: messageId,
      reaction,
    };
  });

  if (rows.length === 0) return;

  const userId = await ensureProfile();
  const { error } = await supabase.from('direct_chat_reactions').upsert(
    rows.map((row) => ({
      ...row,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'message_id,user_id' },
  );

  if (!error) localStorage.removeItem(localReactionKey);
}

function readSavedLocalReactions() {
  try {
    return JSON.parse(localStorage.getItem(localReactionKey) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function friendlyReactionError(message: string) {
  if (message.toLowerCase().includes('could not find the table')) {
    return new Error('Reaction table is missing. Run npm run db:push -- --yes first.');
  }

  return new Error(message);
}
