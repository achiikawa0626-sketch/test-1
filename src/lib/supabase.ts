import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Ключи берутся из .env локально и из Vercel → Settings → Environment Variables на проде.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const pendingAuthRouteKey = 'askgrandma.pendingAuthRoute';

export const isSupabaseConfigured = Boolean(url && anonKey);

const pendingAuthRoute = normalizeRoutedAuthUrl();
clearStaleAuthUrl(pendingAuthRoute);

// Запасные значения позволяют показать понятную подсказку в интерфейсе вместо белого экрана.
export const supabase = createClient(
  url ?? 'https://not-configured.supabase.co',
  anonKey ?? 'not-configured',
);

restoreAuthRouteAfterSignIn(supabase);

function normalizeRoutedAuthUrl() {
  if (typeof window === 'undefined') return null;
  if (!window.location.hash.startsWith('#/')) return null;

  const authHashStart = window.location.hash.indexOf('#', 2);
  if (authHashStart === -1) return null;

  const route = window.location.hash.slice(1, authHashStart);
  const authHash = window.location.hash.slice(authHashStart + 1);
  const authParams = new URLSearchParams(authHash);

  if (!hasAuthParams(authParams)) return null;

  window.sessionStorage.setItem(pendingAuthRouteKey, route);

  const cleanUrl = new URL(window.location.href);
  cleanUrl.hash = `#${authHash}`;
  window.history.replaceState({}, document.title, cleanUrl.toString());

  return route;
}

function clearStaleAuthUrl(routeAfterCleanup: string | null) {
  if (typeof window === 'undefined') return;

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(window.location.search);
  const authParams = hashParams.has('access_token') ? hashParams : searchParams;

  if (!hasAuthParams(authParams)) return;
  if (!isStaleAuthParams(authParams)) return;

  const cleanUrl = new URL(window.location.href);
  removeAuthParams(cleanUrl.searchParams);
  cleanUrl.hash = routeAfterCleanup ? `#${routeAfterCleanup}` : '';
  window.sessionStorage.removeItem(pendingAuthRouteKey);
  window.history.replaceState({}, document.title, cleanUrl.toString());
}

function restoreAuthRouteAfterSignIn(client: SupabaseClient) {
  if (typeof window === 'undefined') return;
  if (!window.sessionStorage.getItem(pendingAuthRouteKey)) return;

  const { data } = client.auth.onAuthStateChange((event, session) => {
    if (event !== 'SIGNED_IN' && !(event === 'INITIAL_SESSION' && session)) return;

    window.setTimeout(() => {
      const route = window.sessionStorage.getItem(pendingAuthRouteKey);
      if (!route) return;

      const cleanUrl = new URL(window.location.href);
      removeAuthParams(cleanUrl.searchParams);
      cleanUrl.hash = `#${route}`;
      window.sessionStorage.removeItem(pendingAuthRouteKey);
      data.subscription.unsubscribe();
      window.location.replace(cleanUrl.toString());
    }, 0);
  });
}

function hasAuthParams(params: URLSearchParams) {
  return params.has('access_token') || params.has('refresh_token');
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
