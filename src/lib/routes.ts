export const appBase = import.meta.env.BASE_URL;
export const routerBase = appBase === '/' ? '' : appBase.replace(/\/$/, '');

export function appPath(path: string) {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath ? `${appBase}${cleanPath}` : appBase;
}

export function appUrl(path: string) {
  return new URL(appPath(path), window.location.origin).toString();
}

export function redirectTo(path: string) {
  window.location.assign(appPath(path));
}
