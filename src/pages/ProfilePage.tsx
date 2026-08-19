import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import {
  loadUserProfile,
  saveUserProfile,
  uploadProfileAvatar,
  validateUsername,
} from '../lib/profile';
import { redirectTo } from '../lib/routes';

export function ProfilePage() {
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
        setMessage(error instanceof Error ? error.message : 'Could not load profile.');
      });
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      await saveUserProfile({ nickname, username });
      setMessage('Profile saved.');
      window.setTimeout(() => redirectTo('/find-family'), 400);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save profile.');
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
      setMessage('Avatar uploaded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not upload avatar.');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }

  const usernameError = username ? validateUsername(username) : '';

  return (
    <main className="container">
      <header className="page-header">
        <Link href="/">AskGrandma</Link>
        <h1>Your profile</h1>
        <p>Choose how your family will recognize you inside the app.</p>
      </header>

      <form className="card profile-editor" onSubmit={save}>
        <button
          className="profile-avatar-button"
          type="button"
          aria-label="Choose profile photo"
          onClick={() => fileInputRef.current?.click()}
        >
          {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{email[0]?.toUpperCase() ?? '?'}</span>}
        </button>
        <div className="profile-photo-actions">
          <button type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}>
            Choose photo
          </button>
          <button
            className="ghost"
            type="button"
            disabled={busy}
            onClick={() => cameraInputRef.current?.click()}
          >
            Take photo
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
          <span>Role</span>
          <strong>{role === 'kid' ? 'Child or parent' : 'Grandma or granddad'}</strong>
        </div>

        <label>
          Nickname
          <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
        </label>

        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            placeholder="unique_name"
            required
          />
        </label>
        {usernameError && <p className="message">{usernameError}</p>}

        <button type="submit" disabled={busy || Boolean(usernameError)}>
          {busy ? 'Saving...' : 'Save and find family'}
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    </main>
  );
}
