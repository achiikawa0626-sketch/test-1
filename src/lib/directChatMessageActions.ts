import { ensureProfile } from './familyConnections';
import { supabase } from './supabase';

export type DirectChatMessagePin = {
  userId: string;
  duration: string;
  expiresAt: number;
};

export type DirectChatMessageActions = Record<
  string,
  {
    favoriteUserIds: string[];
    pins: DirectChatMessagePin[];
  }
>;

type DirectChatMessageActionRow = {
  message_id: string;
  user_id: string;
  action_type: 'favorite' | 'pin';
  pin_duration: string | null;
  pinned_until: string | null;
};

export async function loadDirectChatMessageActions(messageIds: string[]) {
  if (messageIds.length === 0) return {};

  const { data, error } = await supabase
    .from('direct_chat_message_actions')
    .select('message_id, user_id, action_type, pin_duration, pinned_until')
    .in('message_id', messageIds);

  if (error) throw friendlyActionError(error.message);
  return groupActions((data ?? []) as DirectChatMessageActionRow[]);
}

export async function toggleDirectChatFavorite(messageId: string) {
  const userId = await ensureProfile();
  const { data, error } = await supabase
    .from('direct_chat_message_actions')
    .select('id')
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('action_type', 'favorite')
    .maybeSingle();

  if (error) throw friendlyActionError(error.message);
  if (data?.id) {
    await deleteFavorite(data.id);
    return false;
  }

  const { error: insertError } = await supabase.from('direct_chat_message_actions').insert({
    message_id: messageId,
    user_id: userId,
    action_type: 'favorite',
  });

  if (insertError) throw friendlyActionError(insertError.message);
  return true;
}

export async function saveDirectChatPin(input: {
  messageId: string;
  duration: string;
  expiresAt: number;
}) {
  const userId = await ensureProfile();
  const { error } = await supabase.from('direct_chat_message_actions').upsert(
    {
      message_id: input.messageId,
      user_id: userId,
      action_type: 'pin',
      pin_duration: input.duration,
      pinned_until: new Date(input.expiresAt).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'message_id,user_id,action_type' },
  );

  if (error) throw friendlyActionError(error.message);
}

async function deleteFavorite(id: string) {
  const { error } = await supabase.from('direct_chat_message_actions').delete().eq('id', id);
  if (error) throw friendlyActionError(error.message);
}

function groupActions(rows: DirectChatMessageActionRow[]) {
  return rows.reduce<DirectChatMessageActions>((actions, row) => {
    const item = actions[row.message_id] ?? { favoriteUserIds: [], pins: [] };

    if (row.action_type === 'favorite') {
      item.favoriteUserIds = [...item.favoriteUserIds, row.user_id];
    }

    if (row.action_type === 'pin' && row.pin_duration && row.pinned_until) {
      item.pins = [
        ...item.pins,
        {
          userId: row.user_id,
          duration: row.pin_duration,
          expiresAt: new Date(row.pinned_until).getTime(),
        },
      ];
    }

    actions[row.message_id] = item;
    return actions;
  }, {});
}

function friendlyActionError(message: string) {
  if (message.toLowerCase().includes('could not find the table')) {
    return new Error('Message actions table is missing. Run npm run db:push -- --yes first.');
  }

  return new Error(message);
}
