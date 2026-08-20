import type { DirectChatMessage } from './directChat';
import type { FamilyProfile } from './familyConnections';

const ACTIVE_CONTACT_KEY = 'askgrandma.chat.activeContact';
const MESSAGE_PREFIX = 'askgrandma.chat.messages.';

export function readCachedContact(): FamilyProfile | undefined {
  return readJson<FamilyProfile>(ACTIVE_CONTACT_KEY);
}

export function saveCachedContact(contact: FamilyProfile) {
  writeJson(ACTIVE_CONTACT_KEY, contact);
}

export function readCachedMessages(contactId: string) {
  if (!contactId) return [];
  return readJson<DirectChatMessage[]>(messageKey(contactId)) ?? [];
}

export function saveCachedMessages(contactId: string, messages: DirectChatMessage[]) {
  if (!contactId) return;
  writeJson(messageKey(contactId), messages.slice(-40));
}

function messageKey(contactId: string) {
  return `${MESSAGE_PREFIX}${contactId}`;
}

function readJson<T>(key: string): T | undefined {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}
