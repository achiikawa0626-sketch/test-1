import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import {
  loadUserProfile,
  saveUserProfile,
  uploadProfileAvatar,
  validateUsername,
} from '../lib/profile';
import { redirectTo } from '../lib/routes';
import { useAppLanguage } from '../lib/appLanguage';
import { uiText } from '../lib/uiTranslations';

export function ProfilePage() {
  const [language, setLanguage] = useAppLanguage();
  const text = uiText(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'kid' | 'grandparent'>('kid');
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadUserProfile()
      .then((profile) => {
        setEmail(profile.email);
        setNickname(profile.nickname);
        setUsername(profile.username);
        setRole(profile.role);
        setAvatarUrl(profile.avatarUrl);
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : text.profileLoadError);
      });
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      await saveUserProfile({ nickname, username });
      setMessage(text.profileSaved);
      window.setTimeout(() => redirectTo('/find-family'), 400);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.profileSaveError);
    } finally {
      setBusy(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setMessage('');

    try {
      setAvatarUrl(await uploadProfileAvatar(file));
      setMessage(text.profileAvatarSaved);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : text.profileAvatarError);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  const usernameError = username ? validateUsername(username, language) : '';

  return (
    <main className="container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <LanguageSwitcher language={language} onChange={setLanguage} />
        <h1>{text.profileTitle}</h1>
        <p>{text.profileText}</p>
      </header>

      <form className="card profile-editor" onSubmit={save}>
        <button
          className="profile-avatar-button"
          type="button"
          aria-label={text.profileAvatarAria}
          onClick={() => fileInputRef.current?.click()}
        >
          {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{email[0]?.toUpperCase() ?? '?'}</span>}
        </button>
        <div className="profile-photo-actions">
          <button type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}>
            {text.profileChoosePhoto}
          </button>
          <button
            className="ghost"
            type="button"
            disabled={busy}
            onClick={() => cameraInputRef.current?.click()}
          >
            {text.profileTakePhoto}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          hidden
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={uploadAvatar}
          hidden
        />

        <div className="profile-locked-field">
          <span>{text.profileRole}</span>
          <strong>{role === 'kid' ? text.profileKid : text.profileGrandparent}</strong>
        </div>

        <label>
          {text.profileNickname}
          <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
        </label>

        <label>
          {text.profileUsername}
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            placeholder="unique_name"
            required
          />
        </label>
        {usernameError && <p className="message">{usernameError}</p>}

        <button type="submit" disabled={busy || Boolean(usernameError)}>
          {busy ? text.profileSaving : text.profileSave}
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    </main>
  );
}
