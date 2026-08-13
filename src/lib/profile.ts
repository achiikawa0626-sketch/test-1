import { readAccountMode } from './accountMode';
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
  role: 'kid' | 'grandparent';
  avatarUrl?: string;
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

  return {
    email,
    nickname: saved.nickname || fallbackName,
    username: saved.username,
    role: saved.role,
    avatarUrl: saved.avatarUrl,
  };
}

export async function saveUserProfile(input: { nickname: string; username: string }) {
  const user = await readUser();
  const username = input.username.trim().toLowerCase();
  const usernameError = validateUsername(username);
  if (usernameError) throw new Error(usernameError);

  if (isTakenUsername(user.id, username)) {
    throw new Error('This username is already taken on this device.');
  }

  const saved = readSavedProfile(user.id);
  writeSavedProfile(user.id, {
    ...saved,
    nickname: input.nickname.trim() || username,
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
  saveUsernameOwner(userId, profile.username);
}

function isTakenUsername(userId: string, username: string) {
  const owners = readUsernameOwners();
  const owner = owners[username];
  return Boolean(owner && owner !== userId);
}

function saveUsernameOwner(userId: string, username: string) {
  const owners = readUsernameOwners();
  owners[username] = userId;
  localStorage.setItem('askgrandma-usernames', JSON.stringify(owners));
}

function readUsernameOwners(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('askgrandma-usernames') ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
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
