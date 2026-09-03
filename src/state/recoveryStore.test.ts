import { beforeEach, describe, expect, it } from 'vitest';
import { createEmptyDomainState } from '../domain/types';
import { createRecoveryCommands } from '../domain/commands';
import { RECOVERY_STORAGE_KEY, loadPersistedState } from './persistence';
import { resetDomainState, replaceDomainState } from './recoveryStore';

describe('recovery store persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());
  });

  it('preserves state across loadPersistedState reloads', () => {
    const commands = createRecoveryCommands();

    const createResult = commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      {
        actor: 'user',
        source: 'ui',
      }
    );

    expect(createResult.ok).toBe(true);

    const loaded = loadPersistedState();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok || !createResult.ok) {
      return;
    }

    expect(loaded.state.case?.id).toBe(createResult.data.id);
    expect(loaded.state.case?.incidentType).toBe('home_flood');
  });

  it('reset removes persisted state storage key', () => {
    const commands = createRecoveryCommands();

    commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      {
        actor: 'user',
        source: 'ui',
      }
    );

    expect(window.localStorage.getItem(RECOVERY_STORAGE_KEY)).not.toBeNull();

    resetDomainState();

    expect(window.localStorage.getItem(RECOVERY_STORAGE_KEY)).toBeNull();
  });

  it('migrates incompatible persisted payloads to empty state', () => {
    window.localStorage.setItem(
      RECOVERY_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, unexpected: true })
    );

    const loaded = loadPersistedState();

    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }

    expect(loaded.state.schemaVersion).toBe(1);
    expect(loaded.state.case).toBeNull();
    expect(loaded.state.records).toHaveLength(0);
  });
});
