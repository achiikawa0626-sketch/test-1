import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { readAccountMode } from '../lib/accountMode';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type AuthStatusProps = {
  compact?: boolean;
};

export function AuthStatus({ compact = false }: AuthStatusProps) {
  const [email, setEmail] = useState<string>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return <p className="auth-status">Supabase is not connected.</p>;
  }

  if (!email) {
    return (
      <div className={compact ? 'auth-status compact' : 'auth-status'}>
        <span>Not logged in</span>
        <Link href="/login">Log in</Link>
      </div>
    );
  }

  return (
    <div className={compact ? 'auth-status compact' : 'auth-status'}>
      <span>
        {readAccountMode() === 'kid' ? 'Kid/parent' : 'Grandparent'}: {email}
      </span>
      <Link href="/profile">Profile</Link>
    </div>
  );
}
