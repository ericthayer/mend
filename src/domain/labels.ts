import type { RecoveryCase } from './types';

export const INCIDENT_LABELS: Record<RecoveryCase['incidentType'], string> = {
  home_flood: 'Home flood',
  home_fire: 'Home fire',
  severe_weather: 'Severe weather',
  temporary_displacement: 'Temporary displacement',
  other: 'Other disruption',
};
