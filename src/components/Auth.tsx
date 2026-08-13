import { useState } from 'react';
import { AccountSwitch } from './AccountSwitch';
import { readAccountMode, saveAccountMode } from '../lib/accountMode';
import { appUrl, redirectTo } from '../lib/routes';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [accountMode, setAccountMode] = useState(readAccountMode);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  function changeAccountMode(nextMode: typeof accountMode) {
    setAccountMode(nextMode);
    saveAccountMode(nextMode);
  }

  async function signInWithGoogle() {
    setBusy(true);
    setMessage('');

    try {
      if (mode === 'signup') saveAccountMode(accountMode);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: appUrl('/profile'),
        },
      });

      if (error) setMessage(error.message);
    } catch {
      setMessage('Could not open Google sign in. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      if (mode === 'signup') saveAccountMode(accountMode);
      const request =
        mode === 'signup'
          ? supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: appUrl('/profile') },
            })
          : supabase.auth.signInWithPassword({ email, password });

      const { error } = await request;
      if (error) setMessage(error.message);
      else if (mode === 'signup') setMessage('Done. Check your email if confirmation is needed.');
      else redirectTo('/profile');
    } catch {
      setMessage('Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card auth-card">
      <h2>{mode === 'signin' ? 'Log in' : 'Create account'}</h2>
      <p className="auth-help">
        {mode === 'signin'
          ? 'Choose who you are, then use the account you already created.'
          : 'Choose who you are. You can edit your name and avatar later.'}
      </p>
      <div className="auth-role-choice">
        <p className="auth-role-label">I am a...</p>
        <AccountSwitch mode={accountMode} onChange={changeAccountMode} />
      </div>

      <button className="google-button" type="button" onClick={signInWithGoogle} disabled={busy}>
        {mode === 'signup' ? 'Create with Google' : 'Continue with Google'}
      </button>

      <div className="auth-divider">or use email</div>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password (6+ characters)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
        <button type="submit" disabled={busy}>
          {busy ? 'Loading...' : mode === 'signin' ? 'Log in' : 'Create account'}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <button
        className="ghost"
        type="button"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'No account yet? Create one' : 'Already have an account? Log in'}
      </button>
    </section>
  );
}
