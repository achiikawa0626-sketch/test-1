import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { FamilyChatProfile } from '../lib/familyChatProfile';

type FamilyChatProfileEditorProps = {
  profile: FamilyChatProfile;
  onChange: (profile: FamilyChatProfile) => void;
  onMessage: (message: string) => void;
};

export function FamilyChatProfileEditor({
  profile,
  onChange,
  onMessage,
}: FamilyChatProfileEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function changeName(name: string) {
    onChange({ ...profile, name });
  }

  function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onMessage('Choose a photo for the family picture.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...profile, photoDataUrl: String(reader.result) });
      onMessage('Family photo updated.');
    };
    reader.onerror = () => onMessage('Could not upload this photo.');
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  return (
    <>
      <button
        className="chat-avatar"
        type="button"
        aria-label="Change family photo"
        title="Change family photo"
        onClick={() => inputRef.current?.click()}
      >
        {profile.photoDataUrl ? <img src={profile.photoDataUrl} alt="" /> : <span>F</span>}
      </button>
      <input
        ref={inputRef}
        className="avatar-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={changePhoto}
      />
      <div className="chat-title">
        <input
          className="family-name-input"
          value={profile.name}
          aria-label="Family chat name"
          onChange={(event) => changeName(event.target.value)}
        />
        <p>family</p>
      </div>
    </>
  );
}
