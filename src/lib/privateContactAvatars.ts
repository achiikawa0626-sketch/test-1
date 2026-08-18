import { ensureProfile } from './familyConnections';
import {
  disableOptionalFeature,
  enableOptionalFeature,
  isOptionalFeatureEnabled,
} from './optionalFeatureFlags';
import { supabase } from './supabase';
import { isMissingSupabaseResource } from './supabaseErrors';

const TABLE = 'private_contact_avatars';
const BUCKET = 'private-contact-avatars';
let canUsePrivateContactAvatars = true;

type PrivateContactAvatarRow = {
  avatar_path: string;
};

export async function loadPrivateContactAvatar(contactId: string) {
  if (!canUsePrivateContactAvatars) return undefined;
  if (!isOptionalFeatureEnabled(TABLE)) return undefined;

  const ownerId = await ensureProfile();
  const { data, error } = await supabase
    .from(TABLE)
    .select('avatar_path')
    .eq('owner_id', ownerId)
    .eq('contact_id', contactId)
    .maybeSingle();

  if (error) {
    if (isMissingSupabaseResource(error.message)) {
      canUsePrivateContactAvatars = false;
      disableOptionalFeature(TABLE);
      return undefined;
    }

    throw friendlyPrivateAvatarError(error.message);
  }
  const row = data as PrivateContactAvatarRow | null;
  return row?.avatar_path ? createPrivateContactAvatarUrl(row.avatar_path) : undefined;
}

export async function uploadPrivateContactAvatar(contactId: string, file: File) {
  if (!canUsePrivateContactAvatars) throw missingPrivateAvatarError();
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');

  const ownerId = await ensureProfile();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const avatarPath = `${ownerId}/${contactId}/avatar.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(avatarPath, file, { contentType: file.type, upsert: true });

  if (uploadError) throw handlePrivateAvatarWriteError(uploadError.message);

  const { error: saveError } = await supabase.from(TABLE).upsert(
    {
      owner_id: ownerId,
      contact_id: contactId,
      avatar_path: avatarPath,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'owner_id,contact_id' },
  );

  if (saveError) throw handlePrivateAvatarWriteError(saveError.message);
  enableOptionalFeature(TABLE);
  return createPrivateContactAvatarUrl(avatarPath);
}

async function createPrivateContactAvatarUrl(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return undefined;
  return data.signedUrl;
}

function friendlyPrivateAvatarError(message: string) {
  if (isMissingSupabaseResource(message) || message.toLowerCase().includes(BUCKET)) {
    return missingPrivateAvatarError();
  }

  return new Error(message);
}

function handlePrivateAvatarWriteError(message: string) {
  if (isMissingSupabaseResource(message) || message.toLowerCase().includes(BUCKET)) {
    canUsePrivateContactAvatars = false;
    disableOptionalFeature(TABLE);
  }

  return friendlyPrivateAvatarError(message);
}

function missingPrivateAvatarError() {
  return new Error('Private chat photos need the new database migration first.');
}
