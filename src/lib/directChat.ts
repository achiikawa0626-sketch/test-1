import { readAccountMode } from './accountMode';
import type { AccountMode } from './accountMode';
import { ensureProfile, loadFamilyRequests } from './familyConnections';
import type { FamilyProfile } from './familyConnections';
import { supabase } from './supabase';

export type DirectChatMediaType = 'audio' | 'video';

export type DirectChatMessage = {
  id: string;
  senderRole: AccountMode;
  isMine: boolean;
  body: string;
  mediaType?: DirectChatMediaType;
  mediaPath?: string;
  mediaUrl?: string;
  createdAt: string;
};

type DirectChatRow = {
  id: string;
  sender_id: string;
  body: string | null;
  media_type: DirectChatMediaType | null;
  media_path: string | null;
  created_at: string;
};

export async function loadChatContacts() {
  const requests = await loadFamilyRequests();
  return requests
    .filter((request) => request.status === 'accepted')
    .map((request) => request.profile);
}

export async function loadDirectChat(contactId: string) {
  const userId = await ensureProfile();
  const { data, error } = await supabase
    .from('direct_chat_messages')
    .select('id, sender_id, body, media_type, media_path, created_at')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`,
    )
    .order('created_at', { ascending: false })
    .limit(40);

  if (error) throw friendlyDirectChatError(error.message);
  const rows = ((data ?? []) as DirectChatRow[]).reverse();
  return Promise.all(rows.map((row) => toMessage(row, userId)));
}

export async function loadDirectChatMediaUrls(messages: DirectChatMessage[]) {
  const withMedia = messages.filter((message) => message.mediaPath && !message.mediaUrl);
  if (withMedia.length === 0) return messages;

  const paths = withMedia.flatMap((message) => (message.mediaPath ? [message.mediaPath] : []));
  const { data, error } = await supabase.storage.from('chat-media').createSignedUrls(paths, 3600);
  if (error) return messages;

  const urlByPath = new Map(
    (data ?? []).map((item) => [item.path, item.signedUrl ?? undefined]),
  );

  return messages.map((message) => ({
    ...message,
    mediaUrl: message.mediaPath
      ? urlByPath.get(message.mediaPath) ?? message.mediaUrl
      : message.mediaUrl,
  }));
}

export async function sendDirectChat(input: {
  contact: FamilyProfile;
  body?: string;
  media?: Blob;
  mediaType?: DirectChatMediaType;
}) {
  const userId = await ensureProfile();
  const mediaPath = input.media
    ? await uploadDirectMedia({
        userId,
        contactId: input.contact.id,
        media: input.media,
        mediaType: input.mediaType,
      })
    : undefined;

  const { error } = await supabase.from('direct_chat_messages').insert({
    sender_id: userId,
    receiver_id: input.contact.id,
    body: input.body?.trim() || null,
    media_type: input.mediaType ?? null,
    media_path: mediaPath ?? null,
  });

  if (error) throw friendlyDirectChatError(error.message);
}

export async function deleteDirectChatMessage(messageId: string) {
  const { error } = await supabase.from('direct_chat_messages').delete().eq('id', messageId);
  if (error) throw friendlyDirectChatError(error.message);
}

async function uploadDirectMedia(input: {
  userId: string;
  contactId: string;
  media: Blob;
  mediaType?: DirectChatMediaType;
}) {
  const extension = input.mediaType === 'video' ? 'webm' : 'webm';
  const path = `${input.userId}/${input.contactId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('chat-media').upload(path, input.media);
  if (error) throw error;
  return path;
}

async function toMessage(row: DirectChatRow, userId: string): Promise<DirectChatMessage> {
  const isMine = row.sender_id === userId;
  return {
    id: row.id,
    senderRole: isMine ? readAccountMode() : oppositeMode(readAccountMode()),
    isMine,
    body: row.body ?? '',
    mediaType: row.media_type ?? undefined,
    mediaPath: row.media_path ?? undefined,
    createdAt: row.created_at,
  };
}

function oppositeMode(mode: AccountMode): AccountMode {
  return mode === 'kid' ? 'grandparent' : 'kid';
}

function friendlyDirectChatError(message: string) {
  if (message.toLowerCase().includes('could not find the table')) {
    return new Error('Direct chat table is missing. Run npm run db:push -- --yes first.');
  }

  return new Error(message);
}
