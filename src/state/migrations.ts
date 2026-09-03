import { createEmptyDomainState, type RecoveryDomainState } from '../domain/types';
import { persistedStateSchema, type PersistedState } from '../domain/schemas';

export const CURRENT_SCHEMA_VERSION = 1 as const;

export function migratePersistedState(value: unknown): RecoveryDomainState {
  const parsed = persistedStateSchema.safeParse(value);

  if (parsed.success) {
    return parsed.data;
  }

  const empty = createEmptyDomainState();
  return {
    ...empty,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };
}

export function serializePersistedState(state: RecoveryDomainState): PersistedState {
  return persistedStateSchema.parse(state);
}
