import { UserAccount, SaveState } from '../types/reader';
import { getCookie, setCookie, removeCookie } from './cookieUtils';

const KEYS = {
  USERS_LIST: 'kinetic_accounts_v1',
  CURRENT_USER_ID: 'kinetic_current_user_id_v1',
  STATES_PREFIX: 'kinetic_states_user_',
};

const DEFAULT_AVATARS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ef4444', // red
];

export function getAllAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(KEYS.USERS_LIST);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveAllAccounts(users: UserAccount[]): void {
  try {
    localStorage.setItem(KEYS.USERS_LIST, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save accounts list', e);
  }
}

export function getCurrentUser(): UserAccount | null {
  try {
    // Check cookie first or localStorage
    const cookieUserId = getCookie('kinetic_logged_user_id');
    const localUserId = localStorage.getItem(KEYS.CURRENT_USER_ID);
    const userId = cookieUserId || localUserId;

    if (!userId) return null;

    const accounts = getAllAccounts();
    return accounts.find(u => u.id === userId) || null;
  } catch {
    return null;
  }
}

export function loginUser(username: string): UserAccount {
  const accounts = getAllAccounts();
  const trimmed = username.trim();
  const normalized = trimmed.toLowerCase();

  let user = accounts.find(u => u.username.toLowerCase() === normalized);

  if (!user) {
    // Create new account
    const randomColor = DEFAULT_AVATARS[accounts.length % DEFAULT_AVATARS.length];
    user = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      username: trimmed,
      displayName: trimmed,
      avatarColor: randomColor,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    accounts.push(user);
    saveAllAccounts(accounts);
  } else {
    user.lastActive = Date.now();
    saveAllAccounts(accounts);
  }

  // Set active user in both cookie and localStorage
  setCookie('kinetic_logged_user_id', user.id, 90);
  try {
    localStorage.setItem(KEYS.CURRENT_USER_ID, user.id);
  } catch {
    // ignore
  }

  return user;
}

export function logoutUser(): void {
  removeCookie('kinetic_logged_user_id');
  try {
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  } catch {
    // ignore
  }
}

export function getUserSaveStates(userId: string): SaveState[] {
  try {
    const key = `${KEYS.STATES_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveUserState(state: SaveState): void {
  try {
    const key = `${KEYS.STATES_PREFIX}${state.userId}`;
    const current = getUserSaveStates(state.userId).filter(s => s.id !== state.id);
    current.unshift(state);
    // Keep up to 50 save states per user
    localStorage.setItem(key, JSON.stringify(current.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export function deleteUserState(userId: string, stateId: string): void {
  try {
    const key = `${KEYS.STATES_PREFIX}${userId}`;
    const current = getUserSaveStates(userId).filter(s => s.id !== stateId);
    localStorage.setItem(key, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete save state', e);
  }
}

export function exportUserStatesJson(userId: string): string {
  const states = getUserSaveStates(userId);
  return JSON.stringify(states, null, 2);
}

export function importUserStatesJson(userId: string, jsonStr: string): number {
  try {
    const parsed = JSON.parse(jsonStr) as SaveState[];
    if (Array.isArray(parsed)) {
      const existing = getUserSaveStates(userId);
      const existingIds = new Set(existing.map(s => s.id));
      let added = 0;

      for (const item of parsed) {
        if (!existingIds.has(item.id)) {
          existing.push({ ...item, userId });
          added++;
        }
      }

      existing.sort((a, b) => b.updatedAt - a.updatedAt);
      localStorage.setItem(`${KEYS.STATES_PREFIX}${userId}`, JSON.stringify(existing.slice(0, 50)));
      return added;
    }
  } catch (e) {
    console.error('Failed to import save states JSON', e);
  }
  return 0;
}
