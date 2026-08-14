import { readAccountMode } from './accountMode';
import { ensureProfile } from './familyConnections';
import { AVATAR_BUCKET, createAvatarUrl } from './profileAvatars';
import { readSavedProfile, writeSavedProfile } from './profileLocal';
import type { SavedProfile } from './profileLocal';
import { supabase } from './supabase';

const BAD_WORDS = ['admin', 'support', 'moderator', 'fuck', 'shit', 'bitch', 'dick', 'asshole'];

export type UserProfile = {
  email: string;
  nickname: string;
  username: string;
  role: 'kid' | 'grandparent';
  avatarUrl?: string;
};

type ProfileRow = {
  email: string;
  display_name: string;
  username: string | null;
  account_mode: 'kid' | 'grandparent';
  avatar_path: string | null;
};

export function validateUsername(username: string) {
  const value = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(value)) {
    return 'Username must be 3-20 letters, numbers, or underscores.';
  }

  if (BAD_WORDS.some((word) => value.includes(word))) {
    return 'Choose a kind username without bad words.';
  }

  return '';
}

export async function loadUserProfile(): Promise<UserProfile> {
  const user = await readUser();
  await ensureProfile();

  const { data, error } = await supabase
    .from('profiles')
    .select('email, display_name, username, account_mode, avatar_path')
    .eq('id', user.id)
    .single();

  if (error) throw friendlyProfileError(error.message);

  const localProfile = readSavedProfile(user.id);
  const row = await syncLocalProfile(user.id, data as ProfileRow, localProfile);
  const avatarUrl = row.avatar_path ? await createAvatarUrl(row.avatar_path) : localProfile.avatarUrl;

  return {
    email: row.email,
    nickname: row.display_name,
    username: row.username ?? '',
    role: row.account_mode,
    avatarUrl,
  };
}

export async function saveUserProfile(input: { nickname: string; username: string }) {
  const user = await readUser();
  await ensureProfile();

  const username = input.username.trim().toLowerCase();
  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.nickname.trim() || username,
      username,
      account_mode: readAccountMode(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) throw friendlyProfileError(error.message);
  writeSavedProfile(user.id, { nickname: input.nickname, username, role: readAccountMode() });
}

export async function uploadProfileAvatar(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');

  const user = await readUser();
  await ensureProfile();

  const avatarPath = `${user.id}/avatar`;
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(avatarPath, file, { contentType: file.type, upsert: true });

  if (uploadError) throw friendlyProfileError(uploadError.message);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_path: avatarPath, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (profileError) throw friendlyProfileError(profileError.message);
  return createAvatarUrl(avatarPath);
}

async function readUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Log in before editing your profile.');
  return data.user;
}

async function syncLocalProfile(userId: string, row: ProfileRow, localProfile: SavedProfile) {
  if (!localProfile.username || row.username) return row;

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: localProfile.nickname || row.display_name,
      username: localProfile.username,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) return row;
  return { ...row, display_name: localProfile.nickname || row.display_name, username: localProfile.username };
}

function friendlyProfileError(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('duplicate') || lowerMessage.includes('profiles_username_unique')) {
    return new Error('This username is already taken.');
  }

  if (lowerMessage.includes('profile-avatars')) {
    return new Error('Avatar storage is not ready. Run npm run db:push -- --yes first.');
  }

  return new Error(message);
}
