import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { readAccountMode } from '../lib/accountMode';
import { homeTranslations } from '../lib/homeTranslations';
import type { HomeTranslation } from '../lib/homeTranslations';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type AuthStatusProps = {
  compact?: boolean;
  labels?: Pick<
    HomeTranslation,
    'authNotLoggedIn' | 'authKidParent' | 'authGrandparent' | 'profileLink' | 'signedOutButton'
  >;
};

export function AuthStatus({ compact = false, labels = homeTranslations.en }: AuthStatusProps) {
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
        <span>{labels.authNotLoggedIn}</span>
        <Link href="/login">{labels.signedOutButton}</Link>
      </div>
    );
  }

  return (
    <div className={compact ? 'auth-status compact' : 'auth-status'}>
      <span>
        {readAccountMode() === 'kid' ? labels.authKidParent : labels.authGrandparent}: {email}
      </span>
      <Link href="/profile">{labels.profileLink}</Link>
    </div>
  );
}
