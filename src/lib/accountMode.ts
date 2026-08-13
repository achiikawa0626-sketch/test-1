export type AccountMode = 'kid' | 'grandparent';

const accountModeKey = 'askgrandma-account-mode';

export function readAccountMode(): AccountMode {
  const savedMode = window.localStorage.getItem(accountModeKey);
  return savedMode === 'grandparent' ? 'grandparent' : 'kid';
}

export function saveAccountMode(mode: AccountMode) {
  window.localStorage.setItem(accountModeKey, mode);
}
