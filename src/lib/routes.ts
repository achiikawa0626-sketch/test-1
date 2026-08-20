export const appBase = import.meta.env.BASE_URL;
export const routerBase = appBase === '/' ? '' : appBase.replace(/\/$/, '');
export const isGitHubPagesBuild = routerBase !== '';

export function appPath(path: string) {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (isGitHubPagesBuild) return cleanPath ? `${appBase}#/${cleanPath}` : `${appBase}#/`;
  return cleanPath ? `${appBase}${cleanPath}` : appBase;
}

export function appUrl(path: string) {
  return new URL(appPath(path), window.location.origin).toString();
}

export function redirectTo(path: string) {
  window.location.assign(appPath(path));
}

export function restoreGitHubPagesRoute() {
  if (!window.location.search.startsWith('?/')) return;

  const [routePart, queryPart] = window.location.search.slice(2).split('&');
  const routePath = routePart ? `/${routePart}` : '/';
  const query = queryPart ? `?${queryPart}` : '';

  window.history.replaceState(
    null,
    '',
    `${routerBase}/#${routePath}${query}`,
  );
}
