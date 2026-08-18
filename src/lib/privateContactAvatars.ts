import { ensureProfile } from './familyConnections';
import { supabase } from './supabase';

const BUCKET = 'private-contact-avatars';

type PrivateContactAvatarRow = {
  avatar_path: string;
};

export async function loadPrivateContactAvatar(contactId: string) {
  const ownerId = await ensureProfile();
  const { data, error } = await supabase
    .from('private_contact_avatars')
    .select('avatar_path')
    .eq('owner_id', ownerId)
    .eq('contact_id', contactId)
    .maybeSingle();

  if (error) throw friendlyPrivateAvatarError(error.message);
  const row = data as PrivateContactAvatarRow | null;
  return row?.avatar_path ? createPrivateContactAvatarUrl(row.avatar_path) : undefined;
}

export async function uploadPrivateContactAvatar(contactId: string, file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');

  const ownerId = await ensureProfile();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const avatarPath = `${ownerId}/${contactId}/avatar.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(avatarPath, file, { contentType: file.type, upsert: true });

  if (uploadError) throw friendlyPrivateAvatarError(uploadError.message);

  const { error: saveError } = await supabase.from('private_contact_avatars').upsert(
    {
      owner_id: ownerId,
      contact_id: contactId,
      avatar_path: avatarPath,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'owner_id,contact_id' },
  );

  if (saveError) throw friendlyPrivateAvatarError(saveError.message);
  return createPrivateContactAvatarUrl(avatarPath);
}

async function createPrivateContactAvatarUrl(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return undefined;
  return data.signedUrl;
}

function friendlyPrivateAvatarError(message: string) {
  if (message.toLowerCase().includes('could not find the table')) {
    return new Error('Private contact avatar table is missing. Run npm run db:push -- --yes first.');
  }

  if (message.toLowerCase().includes(BUCKET)) {
    return new Error('Private contact avatar storage is missing. Run npm run db:push -- --yes first.');
  }

  return new Error(message);
}
