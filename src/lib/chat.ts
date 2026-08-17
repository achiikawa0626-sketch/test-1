import { supabase } from './supabase';
import type { AccountMode } from './accountMode';

export type ChatMediaType = 'audio' | 'video';

export type ChatMessage = {
  id: string;
  senderRole: AccountMode;
  senderName?: string;
  isMine?: boolean;
  body: string;
  mediaType?: ChatMediaType;
  mediaUrl?: string;
  createdAt: string;
};

type ChatMessageRow = {
  id: string;
  sender_role: AccountMode;
  body: string | null;
  media_type: ChatMediaType | null;
  media_path: string | null;
  created_at: string;
};

export async function loadChatMessages(memoryId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, sender_role, body, media_type, media_path, created_at')
    .eq('memory_id', memoryId)
    .order('created_at', { ascending: true });

  if (error) throw friendlyChatError(error.message);
  return Promise.all(((data ?? []) as ChatMessageRow[]).map(toChatMessage));
}

export async function sendChatMessage(input: {
  memoryId: string;
  senderRole: AccountMode;
  body?: string;
  media?: Blob;
  mediaType?: ChatMediaType;
}) {
  const mediaPath = input.media
    ? await uploadChatMedia({
        memoryId: input.memoryId,
        media: input.media,
        mediaType: input.mediaType,
      })
    : undefined;
  const { error } = await supabase.from('chat_messages').insert({
    memory_id: input.memoryId,
    sender_role: input.senderRole,
    body: input.body?.trim() || null,
    media_type: input.mediaType ?? null,
    media_path: mediaPath ?? null,
  });

  if (error) throw friendlyChatError(error.message);
}

async function uploadChatMedia(input: {
  memoryId: string;
  media: Blob;
  mediaType?: ChatMediaType;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Please log in before sending media.');

  const extension = input.mediaType === 'video' ? 'webm' : 'webm';
  const path = `${userData.user.id}/${input.memoryId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('chat-media').upload(path, input.media);
  if (error) throw error;
  return path;
}

function friendlyChatError(message: string) {
  if (message.toLowerCase().includes('could not find the table')) {
    return new Error('Chat tables are missing. Run npm run db:push -- --yes first.');
  }

  return new Error(message);
}

async function toChatMessage(row: ChatMessageRow): Promise<ChatMessage> {
  return {
    id: row.id,
    senderRole: row.sender_role,
    body: row.body ?? '',
    mediaType: row.media_type ?? undefined,
    mediaUrl: row.media_path ? await createSignedUrl(row.media_path) : undefined,
    createdAt: row.created_at,
  };
}

async function createSignedUrl(path: string) {
  const { data, error } = await supabase.storage.from('chat-media').createSignedUrl(path, 3600);
  if (error) return undefined;
  return data.signedUrl;
}
