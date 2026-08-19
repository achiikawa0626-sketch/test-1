import { useRef } from 'react';
import type { FamilyProfile } from '../lib/familyConnections';
import type { HomeTranslation } from '../lib/homeTranslations';

type ChatContactHeaderProps = {
  contact?: FamilyProfile;
  customAvatarUrl?: string;
  isOnline?: boolean;
  isUploadingAvatar?: boolean;
  text: HomeTranslation;
  onAvatarChange?: (file: File) => Promise<void>;
};

export function ChatContactHeader({
  contact,
  customAvatarUrl,
  isOnline,
  isUploadingAvatar,
  text,
  onAvatarChange,
}: ChatContactHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const title = contact?.displayName ?? text.familyChatTitle;
  const subtitle = contact?.username ? `@${contact.username}` : text.privateChatLabel;
  const avatarUrl = customAvatarUrl ?? contact?.avatarUrl;
  const canChangeAvatar = Boolean(contact && onAvatarChange);

  return (
    <>
      <button
        className={canChangeAvatar ? 'chat-avatar' : 'chat-avatar chat-avatar--static'}
        type="button"
        aria-label={canChangeAvatar ? text.changeChatPhotoLabel : text.chatPhotoLabel}
        disabled={!canChangeAvatar || isUploadingAvatar}
        title={canChangeAvatar ? text.changeChatPhotoLabel : undefined}
        onClick={() => inputRef.current?.click()}
      >
        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{title.charAt(0).toUpperCase()}</span>}
      </button>
      {canChangeAvatar && (
        <input
          ref={inputRef}
          className="avatar-input"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file && onAvatarChange) void onAvatarChange(file);
          }}
        />
      )}
      <div className="chat-title">
        <strong>{title}</strong>
        <p>
          {subtitle}
          {contact && (
            <span className={isOnline ? 'chat-status online' : 'chat-status offline'}>
              <i />
              {isOnline ? text.onlineLabel : text.awayLabel}
            </span>
          )}
        </p>
      </div>
    </>
  );
}
