import type { CommandContext } from '../domain/types';
import { createRecoveryCommands } from '../domain/commands';

const FLOOD_SUMMARY =
  'A burst pipe flooded the apartment. The household is safe and temporarily staying with a friend.';

export function seedFloodDemo() {
  const commands = createRecoveryCommands();

  const seedContext: CommandContext = {
    actor: 'system',
    source: 'seed',
  };

  const createResult = commands.createCase(
    {
      incidentType: 'home_flood',
      summary: FLOOD_SUMMARY,
      safetyStatus: 'confirmed_safe',
      householdNeeds: ['accessible_housing', 'mobility', 'temporary_housing'],
    },
    seedContext
  );

  if (!createResult.ok) {
    return createResult;
  }

  const landlordRecord = commands.addRecord(
    {
      category: 'communication',
      title: 'Landlord request',
      note: 'Landlord requested photos of the damage.',
    },
    seedContext
  );

  if (!landlordRecord.ok) {
    return landlordRecord;
  }

  const housingRecord = commands.addRecord(
    {
      category: 'housing',
      title: 'Temporary stay window',
      note: 'Temporary stay with a friend is available through Friday.',
    },
    seedContext
  );

  if (!housingRecord.ok) {
    return housingRecord;
  }

  return createResult;
}
