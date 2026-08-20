import { useState } from 'react';
import { AccountSwitch } from './AccountSwitch';
import { readAccountMode, saveAccountMode } from '../lib/accountMode';
import { useAppLanguage } from '../lib/appLanguage';
import { appUrl, redirectTo } from '../lib/routes';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { uiText } from '../lib/uiTranslations';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';

export function Auth() {
  const [language] = useAppLanguage();
  const text = uiText(language);
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
      setMessage(text.authGoogleError);
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
      else if (mode === 'signup') setMessage(text.authSuccess);
      else redirectTo('/profile');
    } catch {
      setMessage(text.authSomethingWrong);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card auth-card">
      <h2>{mode === 'signin' ? text.authLogin : text.authCreate}</h2>
      <p className="auth-help">
        {mode === 'signin'
          ? text.authLoginHelp
          : text.authCreateHelp}
      </p>
      <div className="auth-role-choice">
        <p className="auth-role-label">{text.authRoleLabel}</p>
        <AccountSwitch mode={accountMode} onChange={changeAccountMode} />
      </div>

      <button className="google-button" type="button" onClick={signInWithGoogle} disabled={busy}>
        {mode === 'signup' ? text.authCreateGoogle : text.authWithGoogle}
      </button>

      <div className="auth-divider">{text.authDivider}</div>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder={text.authEmail}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder={text.authPassword}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
        <button type="submit" disabled={busy}>
          {busy ? text.authLoading : mode === 'signin' ? text.authLogin : text.authCreate}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <button
        className="ghost"
        type="button"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? text.authNoAccount : text.authAlreadyAccount}
      </button>
    </section>
  );
}
