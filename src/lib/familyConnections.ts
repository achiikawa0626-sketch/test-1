import type { AccountMode } from './accountMode';
import { readAccountMode } from './accountMode';
import { friendlyFamilyError } from './familyErrors';
import type { FamilyProfile, FamilyRequest } from './familyTypes';
import { createAvatarUrl } from './profileAvatars';
import { supabase } from './supabase';

export type { FamilyProfile, FamilyRequest } from './familyTypes';

export type FamilyRequestResult = 'accepted' | 'sent';

type ProfileRow = {
  id: string;
  email: string;
  display_name: string;
  username?: string | null;
  account_mode: AccountMode;
  avatar_path?: string | null;
};

type RequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  requester: ProfileRow | ProfileRow[] | null;
  receiver: ProfileRow | ProfileRow[] | null;
};

const requestSelects = [
  'id, requester_id, receiver_id, status, requester:profiles!family_requests_requester_id_fkey(id, email, display_name, username, account_mode, avatar_path), receiver:profiles!family_requests_receiver_id_fkey(id, email, display_name, username, account_mode, avatar_path)',
  'id, requester_id, receiver_id, status, requester:profiles!family_requests_requester_id_fkey(id, email, display_name, username, account_mode), receiver:profiles!family_requests_receiver_id_fkey(id, email, display_name, username, account_mode)',
  'id, requester_id, receiver_id, status, requester:profiles!family_requests_requester_id_fkey(id, email, display_name, account_mode), receiver:profiles!family_requests_receiver_id_fkey(id, email, display_name, account_mode)',
];
type RequestStatusRow = Pick<RequestRow, 'id' | 'requester_id' | 'receiver_id' | 'status'>;

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
          account_mode: readAccountMode(),
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
  return Promise.all(((data ?? []) as ProfileRow[]).map(toProfile));
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

export async function cancelFamilyRequest(requestId: string) {
  const { error } = await supabase.from('family_requests').delete().eq('id', requestId);
  if (error) throw friendlyFamilyError(error.message);
}
export async function loadFamilyRequests() {
  const userId = await ensureProfile();
  const rows = await loadFamilyRequestRows(userId);
  return Promise.all(rows.map(async (request) => {
    const direction: FamilyRequest['direction'] =
      request.requester_id === userId ? 'outgoing' : 'incoming';
    const profile = direction === 'outgoing' ? request.receiver : request.requester;
    return {
      id: request.id,
      status: request.status,
      direction,
      profile: await toProfile(readProfile(profile)),
    };
  }));
}

async function loadFamilyRequestRows(userId: string) {
  for (const select of requestSelects) {
    const { data, error } = await supabase
      .from('family_requests')
      .select(select)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (!error) return (data ?? []) as unknown as RequestRow[];
    if (!isColumnError(error.message)) throw friendlyFamilyError(error.message);
  }

  throw new Error('Could not load family requests.');
}

function isColumnError(message: string) {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('column') || lowerMessage.includes('schema cache');
}

function readProfile(profile: ProfileRow | ProfileRow[] | null) {
  if (Array.isArray(profile)) return profile[0];
  if (!profile) throw new Error('Family profile was not found.');
  return profile;
}

async function toProfile(row: ProfileRow): Promise<FamilyProfile> {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    username: row.username ?? undefined,
    accountMode: row.account_mode,
    avatarUrl: row.avatar_path ? await createAvatarUrl(row.avatar_path) : undefined,
  };
}
