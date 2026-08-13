export type FamilyChatProfile = {
  name: string;
  photoDataUrl?: string;
};

const STORAGE_KEY = 'askgrandma-family-chat-profile';

export function loadFamilyChatProfile(): FamilyChatProfile {
  const fallback: FamilyChatProfile = { name: 'Family chat' };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved) as Partial<FamilyChatProfile>;
    return {
      name: parsed.name?.trim() || fallback.name,
      photoDataUrl: parsed.photoDataUrl,
    };
  } catch {
    return fallback;
  }
}

export function saveFamilyChatProfile(profile: FamilyChatProfile) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name: profile.name.trim() || 'Family chat',
      photoDataUrl: profile.photoDataUrl,
    }),
  );
}
