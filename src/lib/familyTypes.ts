import type { AccountMode } from './accountMode';

export type FamilyProfile = {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  accountMode: AccountMode;
  avatarUrl?: string;
};

export type FamilyRequest = {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  direction: 'incoming' | 'outgoing';
  profile: FamilyProfile;
};
