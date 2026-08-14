import { supabase } from './supabase';

export const AVATAR_BUCKET = 'profile-avatars';

export async function createAvatarUrl(path: string) {
  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return undefined;
  return data.signedUrl;
}
