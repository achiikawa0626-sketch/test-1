import { createClient } from '@supabase/supabase-js';

// Ключи берутся из .env локально и из Vercel → Settings → Environment Variables на проде.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

clearStaleAuthUrl();

// Запасные значения позволяют показать понятную подсказку в интерфейсе вместо белого экрана.
export const supabase = createClient(
  url ?? 'https://not-configured.supabase.co',
  anonKey ?? 'not-configured',
);

function clearStaleAuthUrl() {
  if (typeof window === 'undefined') return;

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(window.location.search);
  const authParams = hashParams.has('access_token') ? hashParams : searchParams;

  if (!authParams.has('access_token') && !authParams.has('refresh_token')) return;
  if (!isStaleAuthParams(authParams)) return;

  const cleanUrl = new URL(window.location.href);
  removeAuthParams(cleanUrl.searchParams);
  cleanUrl.hash = '';
  window.history.replaceState({}, document.title, cleanUrl.toString());
}

function isStaleAuthParams(params: URLSearchParams) {
  const expiresAt = Number(params.get('expires_at'));
  const expiresIn = Number(params.get('expires_in'));
  const now = Math.floor(Date.now() / 1000);

  if (Number.isFinite(expiresAt) && expiresAt <= now + 5) return true;
  if (!Number.isFinite(expiresAt) || !Number.isFinite(expiresIn)) return false;

  const issuedAt = expiresAt - expiresIn;
  return now - issuedAt > 120;
}

function removeAuthParams(params: URLSearchParams) {
  [
    'access_token',
    'expires_at',
    'expires_in',
    'provider_refresh_token',
    'provider_token',
    'refresh_token',
    'token_type',
    'type',
  ].forEach((key) => params.delete(key));
}
