import { readAccountMode } from './accountMode';
import type { AccountMode } from './accountMode';
import { supabase } from './supabase';

const BAD_WORDS = ['admin', 'support', 'moderator', 'fuck', 'shit', 'bitch', 'dick', 'asshole'];

export type UserProfile = {
  email: string;
  nickname: string;
  username: string;
  role: 'kid' | 'grandparent';
  avatarUrl?: string;
};

type SavedProfile = {
  nickname: string;
  username: string;
  role: AccountMode;
  avatarUrl?: string;
};

type ProfileRow = {
  display_name: string;
  username: string | null;
  account_mode: AccountMode;
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
  const saved = readSavedProfile(user.id);
  const email = user.email ?? '';
  const fallbackName = user.user_metadata.full_name ?? email.split('@')[0] ?? 'Family member';
  const profile = await ensureRemoteProfile({
    id: user.id,
    email,
    fallbackName,
    savedRole: saved.role,
  });

  return {
    email,
    nickname: profile.display_name || saved.nickname || fallbackName,
    username: profile.username ?? saved.username,
    role: profile.account_mode,
    avatarUrl: saved.avatarUrl,
  };
}

export async function saveUserProfile(input: { nickname: string; username: string }) {
  const user = await readUser();
  const saved = readSavedProfile(user.id);
  const username = input.username.trim().toLowerCase();
  const nickname = input.nickname.trim() || username;
  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);

  await saveRemoteProfile({
    id: user.id,
    email: user.email ?? '',
    nickname,
    username,
    role: saved.role,
  });

  writeSavedProfile(user.id, {
    ...saved,
    nickname,
    username,
  });
}

export async function uploadProfileAvatar(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');

  const user = await readUser();
  const avatarUrl = await readFileAsDataUrl(file);
  const saved = readSavedProfile(user.id);
  writeSavedProfile(user.id, { ...saved, avatarUrl });
  return avatarUrl;
}

async function readUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Log in before editing your profile.');
  return data.user;
}

async function ensureRemoteProfile(input: {
  id: string;
  email: string;
  fallbackName: string;
  savedRole: AccountMode;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, username, account_mode')
    .eq('id', input.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return data as ProfileRow;

  const newProfile = {
    display_name: input.fallbackName,
    username: null,
    account_mode: input.savedRole,
  };
  const { error: insertError } = await supabase.from('profiles').insert({
    id: input.id,
    email: input.email,
    ...newProfile,
  });

  if (insertError) throw new Error(insertError.message);
  return newProfile;
}

async function saveRemoteProfile(input: {
  id: string;
  email: string;
  nickname: string;
  username: string;
  role: AccountMode;
}) {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('account_mode')
    .eq('id', input.id)
    .maybeSingle();

  const { error } = await supabase.from('profiles').upsert({
    id: input.id,
    email: input.email,
    display_name: input.nickname,
    username: input.username,
    account_mode: (existingProfile?.account_mode as AccountMode | undefined) ?? input.role,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (error.message.toLowerCase().includes('duplicate')) {
      throw new Error('This username is already taken.');
    }
    throw new Error(error.message);
  }
}

function readSavedProfile(userId: string): SavedProfile {
  const fallback: SavedProfile = {
    nickname: '',
    username: '',
    role: readAccountMode(),
  };

  try {
    const saved = localStorage.getItem(profileKey(userId));
    return saved ? { ...fallback, ...(JSON.parse(saved) as Partial<SavedProfile>) } : fallback;
  } catch {
    return fallback;
  }
}

function writeSavedProfile(userId: string, profile: SavedProfile) {
  localStorage.setItem(profileKey(userId), JSON.stringify(profile));
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not upload avatar.'));
    reader.readAsDataURL(file);
  });
}

function profileKey(userId: string) {
  return `askgrandma-profile-${userId}`;
}
