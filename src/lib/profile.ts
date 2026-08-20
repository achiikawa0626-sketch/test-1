import { readAccountMode } from './accountMode';
import type { AccountMode } from './accountMode';
import { ensureProfile } from './familyConnections';
import { AVATAR_BUCKET, createAvatarUrl } from './profileAvatars';
import { readSavedProfile, writeSavedProfile } from './profileLocal';
import type { SavedProfile } from './profileLocal';
import { validateUsername } from './profileValidation';
import { supabase } from './supabase';

export { validateUsername } from './profileValidation';

export type UserProfile = {
  email: string;
  nickname: string;
  username: string;
  role: 'kid' | 'grandparent';
  avatarUrl?: string;
};

type ProfileRow = {
  email?: string;
  display_name: string;
  username?: string | null;
  account_mode: AccountMode;
  avatar_path?: string | null;
};

const profileSelects = [
  'email, display_name, account_mode',
  'email, display_name, username, account_mode',
  'email, display_name, username, account_mode, avatar_path',
];

export async function loadUserProfile(): Promise<UserProfile> {
  const user = await readUser();
  await ensureProfile();

  const data = await loadProfileRow(user.id);
  const localProfile = readSavedProfile(user.id);
  const row = await syncLocalProfile(user.id, data as ProfileRow, localProfile);
  const avatarUrl = row.avatar_path ? await createAvatarUrl(row.avatar_path) : localProfile.avatarUrl;

  return {
    email: row.email ?? user.email ?? '',
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
  const nickname = input.nickname.trim() || username;
  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);

  const role = readAccountMode();
  await saveProfileRow(user.id, {
    display_name: nickname,
    username,
    account_mode: role,
    updated_at: new Date().toISOString(),
  });

  const saved = readSavedProfile(user.id);
  writeSavedProfile(user.id, { ...saved, nickname, username, role });
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

  if (profileError && !isMissingColumnError(profileError.message)) {
    throw friendlyProfileError(profileError.message);
  }
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

  return {
    ...row,
    display_name: localProfile.nickname || row.display_name,
    username: localProfile.username,
  };
}

async function loadProfileRow(userId: string) {
  for (const select of profileSelects) {
    const { data, error } = await supabase
      .from('profiles')
      .select(select)
      .eq('id', userId)
      .single();

    if (!error) return data as unknown as ProfileRow;
    if (!isMissingColumnError(error.message)) throw friendlyProfileError(error.message);
  }

  throw new Error('Could not load your profile.');
}

async function saveProfileRow(
  userId: string,
  row: {
    display_name: string;
    username: string;
    account_mode: AccountMode;
    updated_at: string;
  },
) {
  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  if (!error) return;
  if (!isMissingColumnError(error.message)) throw friendlyProfileError(error.message);

  const { username: _username, ...withoutUsername } = row;
  const { error: retryError } = await supabase
    .from('profiles')
    .update(withoutUsername)
    .eq('id', userId);

  if (retryError) throw friendlyProfileError(retryError.message);
}

function isMissingColumnError(message: string) {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('column') || lowerMessage.includes('schema cache');
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
