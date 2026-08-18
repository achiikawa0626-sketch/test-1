import { ensureProfile } from './familyConnections';
import {
  disableOptionalFeature,
  enableOptionalFeature,
  isOptionalFeatureEnabled,
} from './optionalFeatureFlags';
import { supabase } from './supabase';
import { isMissingSupabaseResource } from './supabaseErrors';

const TABLE = 'direct_chat_message_actions';
let canUseMessageActions = true;

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
  if (messageIds.length === 0 || !canUseMessageActions) return {};
  if (!isOptionalFeatureEnabled(TABLE)) return {};

  const { data, error } = await supabase
    .from(TABLE)
    .select('message_id, user_id, action_type, pin_duration, pinned_until')
    .in('message_id', messageIds);

  if (error) {
    if (isMissingSupabaseResource(error.message)) {
      canUseMessageActions = false;
      return {};
    }

    throw friendlyActionError(error.message);
  }
  return groupActions((data ?? []) as DirectChatMessageActionRow[]);
}

export async function toggleDirectChatFavorite(messageId: string) {
  if (!canUseMessageActions) throw missingActionsError();
  const userId = await ensureProfile();
  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('action_type', 'favorite')
    .maybeSingle();

  if (error) throw handleActionWriteError(error.message);
  enableOptionalFeature(TABLE);
  if (data?.id) {
    await deleteFavorite(data.id);
    return false;
  }

  const { error: insertError } = await supabase.from(TABLE).insert({
    message_id: messageId,
    user_id: userId,
    action_type: 'favorite',
  });

  if (insertError) throw handleActionWriteError(insertError.message);
  enableOptionalFeature(TABLE);
  return true;
}

export async function saveDirectChatPin(input: {
  messageId: string;
  duration: string;
  expiresAt: number;
}) {
  if (!canUseMessageActions) throw missingActionsError();
  const userId = await ensureProfile();
  const { error } = await supabase.from(TABLE).upsert(
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

  if (error) throw handleActionWriteError(error.message);
  enableOptionalFeature(TABLE);
}

async function deleteFavorite(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
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
  if (isMissingSupabaseResource(message)) return missingActionsError();
  return new Error(message);
}

function handleActionWriteError(message: string) {
  if (isMissingSupabaseResource(message)) {
    canUseMessageActions = false;
    disableOptionalFeature(TABLE);
  }
  return friendlyActionError(message);
}

function missingActionsError() {
  return new Error('Message actions need the new database migration first.');
}
