import { create } from 'zustand';
import { createEmptyDomainState, type RecoveryDomainState } from '../domain/types';
import { clearPersistedState, loadPersistedState, savePersistedState } from './persistence';

type StoreMeta = {
  storageAvailable: boolean;
  storageWarning: string | null;
};

type RecoveryStore = RecoveryDomainState &
  StoreMeta & {
    replaceState: (next: RecoveryDomainState) => void;
    transact: (recipe: (current: RecoveryDomainState) => RecoveryDomainState) => RecoveryDomainState;
    reset: () => void;
    getDomainState: () => RecoveryDomainState;
  };

const loaded = loadPersistedState();

const initialMeta: StoreMeta = loaded.ok
  ? {
      storageAvailable: loaded.storageAvailable,
      storageWarning: loaded.storageAvailable
        ? null
        : 'Local storage is unavailable. This session will not persist after closing the tab.',
    }
  : {
      storageAvailable: false,
      storageWarning: loaded.error,
    };

const initialState: RecoveryDomainState = loaded.state;

export const useRecoveryStore = create<RecoveryStore>((set, get) => ({
  ...initialState,
  ...initialMeta,
  replaceState(next) {
    savePersistedState(next);
    set({ ...next });
  },
  transact(recipe) {
    const current: RecoveryDomainState = {
      schemaVersion: get().schemaVersion,
      uiStateVersion: get().uiStateVersion,
      case: get().case,
      records: get().records,
      plans: get().plans,
      drafts: get().drafts,
      activity: get().activity,
    };

    const next = recipe(current);
    savePersistedState(next);
    set({ ...next });
    return next;
  },
  reset() {
    const next = createEmptyDomainState();
    clearPersistedState();
    set({ ...next });
  },
  getDomainState() {
    return {
      schemaVersion: get().schemaVersion,
      uiStateVersion: get().uiStateVersion,
      case: get().case,
      records: get().records,
      plans: get().plans,
      drafts: get().drafts,
      activity: get().activity,
    };
  },
}));

export function getCurrentDomainState(): RecoveryDomainState {
  const state = useRecoveryStore.getState();
  return state.getDomainState();
}

export function replaceDomainState(next: RecoveryDomainState): void {
  useRecoveryStore.getState().replaceState(next);
}

export function transactDomainState(
  recipe: (current: RecoveryDomainState) => RecoveryDomainState
): RecoveryDomainState {
  return useRecoveryStore.getState().transact(recipe);
}

export function resetDomainState(): void {
  useRecoveryStore.getState().reset();
}
