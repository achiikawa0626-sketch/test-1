import { readAccountMode } from './accountMode';
import type { AccountMode } from './accountMode';
import { supabase } from './supabase';

export type FamilyProfile = {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  accountMode: AccountMode;
};

export type FamilyRequest = {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  direction: 'incoming' | 'outgoing';
  profile: FamilyProfile;
};

export type FamilyRequestResult = 'accepted' | 'sent';

type ProfileRow = {
  id: string;
  email: string;
  display_name: string;
  username?: string | null;
  account_mode: AccountMode;
};

type RequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  requester: ProfileRow | ProfileRow[] | null;
  receiver: ProfileRow | ProfileRow[] | null;
};

type RequestStatusRow = Pick<RequestRow, 'id' | 'requester_id' | 'receiver_id' | 'status'>;
const familyRequestSelect =
  'id, requester_id, receiver_id, status, requester:profiles!family_requests_requester_id_fkey(id, email, display_name, account_mode), receiver:profiles!family_requests_receiver_id_fkey(id, email, display_name, account_mode)';

export async function ensureProfile() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Log in before finding family.');

  const email = data.user.email ?? '';
  const displayName = data.user.user_metadata.full_name ?? email.split('@')[0] ?? 'Family member';

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();

  const profileRequest = profile
    ? supabase
        .from('profiles')
        .update({
          email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id)
    : supabase.from('profiles').insert({
        id: data.user.id,
        email,
        display_name: displayName,
        account_mode: readAccountMode(),
        updated_at: new Date().toISOString(),
      });

  const { error: profileError } = await profileRequest;

  if (profileError) throw friendlyFamilyError(profileError.message);
  return data.user.id;
}

export async function searchFamilyProfiles(searchText: string) {
  if (searchText.trim().length < 2) return [];

  const { data, error } = await supabase.rpc('search_profiles', {
    search_text: searchText.trim(),
  });

  if (error) throw friendlyFamilyError(error.message);
  return ((data ?? []) as ProfileRow[]).map(toProfile).filter(isOppositeRole);
}

export async function sendFamilyRequest(receiverId: string): Promise<FamilyRequestResult> {
  const userId = await ensureProfile();
  const existingRequest = await findExistingRequest(userId, receiverId);

  if (existingRequest?.status === 'accepted') {
    throw new Error('You are already connected with this family account.');
  }

  if (existingRequest?.status === 'pending') {
    if (existingRequest.receiver_id === userId) {
      await respondToFamilyRequest(existingRequest.id, 'accepted');
      return 'accepted';
    }
    throw new Error('You already sent this family request.');
  }

  if (existingRequest?.requester_id === userId) {
    await deleteFamilyRequest(existingRequest.id);
  }

  const { error } = await supabase.from('family_requests').insert({
    requester_id: userId,
    receiver_id: receiverId,
  });

  if (error) {
    if (error.message.toLowerCase().includes('duplicate')) {
      throw new Error('You already sent this family request.');
    }
    throw friendlyFamilyError(error.message);
  }

  return 'sent';
}

async function findExistingRequest(userId: string, receiverId: string) {
  const { data, error } = await supabase
    .from('family_requests')
    .select('id, requester_id, receiver_id, status')
    .or(
      `and(requester_id.eq.${userId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${userId})`,
    );

  if (error) throw friendlyFamilyError(error.message);
  const requests = (data ?? []) as RequestStatusRow[];
  return (
    requests.find((request) => request.status === 'accepted') ??
    requests.find((request) => request.status === 'pending') ??
    requests[0] ??
    null
  );
}

async function deleteFamilyRequest(requestId: string) {
  const { error } = await supabase.from('family_requests').delete().eq('id', requestId);
  if (error) throw friendlyFamilyError(error.message);
}

export async function respondToFamilyRequest(requestId: string, status: 'accepted' | 'declined') {
  const { error } = await supabase
    .from('family_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) throw friendlyFamilyError(error.message);
}

export async function loadFamilyRequests() {
  const userId = await ensureProfile();
  const { data, error } = await supabase
    .from('family_requests')
    .select(familyRequestSelect)
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw friendlyFamilyError(error.message);
  return toFamilyRequests(data ?? [], userId);
}

function toFamilyRequests(rows: unknown[], userId: string) {
  return (rows as RequestRow[]).map((request) => {
    const direction: FamilyRequest['direction'] =
      request.requester_id === userId ? 'outgoing' : 'incoming';
    const profile = direction === 'outgoing' ? request.receiver : request.requester;

    return {
      id: request.id,
      status: request.status,
      direction,
      profile: toProfile(readProfile(profile)),
    };
  });
}

function readProfile(profile: ProfileRow | ProfileRow[] | null) {
  if (Array.isArray(profile)) return profile[0];
  if (!profile) throw new Error('Family profile was not found.');
  return profile;
}

function toProfile(row: ProfileRow): FamilyProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    username: row.username ?? undefined,
    accountMode: row.account_mode,
  };
}

function isOppositeRole(profile: FamilyProfile) {
  return profile.accountMode !== readAccountMode();
}

function friendlyFamilyError(message: string) {
  const lowerMessage = message.toLowerCase();
  const isMissingProfiles =
    lowerMessage.includes('could not find the table') ||
    lowerMessage.includes('profiles') ||
    lowerMessage.includes('family_requests') ||
    lowerMessage.includes('search_profiles') ||
    lowerMessage.includes('recent_profiles');

  if (isMissingProfiles) {
    return new Error('Supabase family tables are missing. Run npm run db:push -- --yes first.');
  }

  return new Error(message);
}
