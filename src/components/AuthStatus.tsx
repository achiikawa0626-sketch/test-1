import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { readAccountMode } from '../lib/accountMode';
import { useAppLanguage } from '../lib/appLanguage';
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
  const [language] = useAppLanguage();
  const text = labels === homeTranslations.en ? homeTranslations[language] : labels;
  const [email, setEmail] = useState<string>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email);
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
        <span>{text.authNotLoggedIn}</span>
        <Link href="/login">{text.signedOutButton}</Link>
      </div>
    );
  }

  return (
    <div className={compact ? 'auth-status compact' : 'auth-status'}>
      <span>
        {readAccountMode() === 'kid' ? text.authKidParent : text.authGrandparent}: {email}
      </span>
      <Link href="/profile">{text.profileLink}</Link>
    </div>
  );
}
