import { createEmptyDomainState, type RecoveryDomainState } from '../domain/types';
import { migratePersistedState, serializePersistedState } from './migrations';

export const RECOVERY_STORAGE_KEY = 'mend:recovery-planner:v1';

type SafeStorageResult =
  | { ok: true; state: RecoveryDomainState; storageAvailable: true }
  | { ok: true; state: RecoveryDomainState; storageAvailable: false }
  | { ok: false; error: string; state: RecoveryDomainState; storageAvailable: false };

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPersistedState(): SafeStorageResult {
  const storage = getStorage();
  if (!storage) {
    return {
      ok: true,
      state: createEmptyDomainState(),
      storageAvailable: false,
    };
  }

  try {
    const raw = storage.getItem(RECOVERY_STORAGE_KEY);
    if (!raw) {
      return {
        ok: true,
        state: createEmptyDomainState(),
        storageAvailable: true,
      };
    }

    const parsed = JSON.parse(raw) as unknown;
    const migrated = migratePersistedState(parsed);

    return {
      ok: true,
      state: migrated,
      storageAvailable: true,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to load persisted state.',
      state: createEmptyDomainState(),
      storageAvailable: false,
    };
  }
}

export function savePersistedState(state: RecoveryDomainState): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    const serializable = serializePersistedState(state);
    storage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(serializable));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedState(): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(RECOVERY_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
