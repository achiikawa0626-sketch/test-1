import { readAccountMode } from './accountMode';

export type SavedProfile = {
  nickname: string;
  username: string;
  role: 'kid' | 'grandparent';
  avatarUrl?: string;
};

export function readSavedProfile(userId: string): SavedProfile {
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

export function writeSavedProfile(userId: string, profile: SavedProfile) {
  localStorage.setItem(profileKey(userId), JSON.stringify(profile));
}

function profileKey(userId: string) {
  return `askgrandma-profile-${userId}`;
}
