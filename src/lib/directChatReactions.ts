import { ensureProfile } from './familyConnections';
import {
  disableOptionalFeature,
  enableOptionalFeature,
  isOptionalFeatureEnabled,
} from './optionalFeatureFlags';
import { supabase } from './supabase';
import { isMissingSupabaseResource } from './supabaseErrors';

const TABLE = 'direct_chat_reactions';
const localReactionKey = 'ask-grandma-direct-chat-reactions';
let hasSyncedLocalReactions = false;
let canUseReactionsTable = true;

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
  const savedLocalReactions = readSavedLocalReactions();
  if (!canUseReactionsTable) return groupLocalReactions(messageIds, savedLocalReactions);
  if (!isOptionalFeatureEnabled(TABLE)) {
    return groupLocalReactions(messageIds, savedLocalReactions);
  }

  await syncSavedLocalReactions(messageIds, savedLocalReactions);

  const { data, error } = await supabase
    .from(TABLE)
    .select('message_id, user_id, reaction')
    .in('message_id', messageIds)
    .order('updated_at', { ascending: true });

  if (error) {
    if (isMissingSupabaseResource(error.message)) {
      canUseReactionsTable = false;
      disableOptionalFeature(TABLE);
      return groupLocalReactions(messageIds, savedLocalReactions);
    }

    throw friendlyReactionError(error.message);
  }
  return groupReactions((data ?? []) as DirectChatReactionRow[]);
}

export async function saveDirectChatReaction(messageId: string, reaction: string) {
  if (!canUseReactionsTable) {
    saveLocalReaction(messageId, reaction);
    throw missingReactionsError();
  }

  const userId = await ensureProfile();
  const { error } = await supabase.from(TABLE).upsert(
    {
      message_id: messageId,
      user_id: userId,
      reaction,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'message_id,user_id' },
  );

  if (error) {
    if (isMissingSupabaseResource(error.message)) {
      canUseReactionsTable = false;
      disableOptionalFeature(TABLE);
      saveLocalReaction(messageId, reaction);
    }

    throw friendlyReactionError(error.message);
  }

  enableOptionalFeature(TABLE);
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

async function syncSavedLocalReactions(
  messageIds: string[],
  savedReactions: Record<string, string>,
) {
  if (hasSyncedLocalReactions) return;
  hasSyncedLocalReactions = true;

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
  const { error } = await supabase.from(TABLE).upsert(
    rows.map((row) => ({
      ...row,
      user_id: userId,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'message_id,user_id' },
  );

  if (!error) {
    enableOptionalFeature(TABLE);
    localStorage.removeItem(localReactionKey);
    return;
  }

  if (isMissingSupabaseResource(error.message)) {
    canUseReactionsTable = false;
    disableOptionalFeature(TABLE);
  }
}

function readSavedLocalReactions() {
  try {
    return JSON.parse(localStorage.getItem(localReactionKey) ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

function saveLocalReaction(messageId: string, reaction: string) {
  localStorage.setItem(
    localReactionKey,
    JSON.stringify({
      ...readSavedLocalReactions(),
      [messageId]: reaction,
    }),
  );
}

function groupLocalReactions(messageIds: string[], savedReactions: Record<string, string>) {
  return messageIds.reduce<Record<string, DirectChatReaction[]>>((reactions, messageId) => {
    const reaction = savedReactions[messageId];
    if (reaction) reactions[messageId] = [{ userId: 'local', reaction }];
    return reactions;
  }, {});
}

function friendlyReactionError(message: string) {
  if (isMissingSupabaseResource(message)) return missingReactionsError();

  return new Error(message);
}

function missingReactionsError() {
  return new Error('Reactions need the new database migration first.');
}
