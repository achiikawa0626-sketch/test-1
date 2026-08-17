import { ensureProfile } from './familyConnections';
import { supabase } from './supabase';

type ReactionRow = {
  message_id: string;
  reaction: string;
  updated_at: string;
};

export async function loadDirectChatReactions(messageIds: string[]) {
  if (messageIds.length === 0) return {};

  const { data, error } = await supabase
    .from('direct_chat_reactions')
    .select('message_id, reaction, updated_at')
    .in('message_id', messageIds)
    .order('updated_at', { ascending: true });

  if (error) return {};
  return toReactionMap((data ?? []) as ReactionRow[]);
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

  if (error) throw new Error('Could not save reaction. Run npm run db:push -- --yes first.');
}

function toReactionMap(rows: ReactionRow[]) {
  return rows.reduce<Record<string, string>>((reactions, row) => {
    reactions[row.message_id] = row.reaction;
    return reactions;
  }, {});
}
