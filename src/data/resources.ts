export type ResourceEntry = {
  id:
    | 'ready_critical_documents'
    | 'redcross_damage_inventory'
    | 'fema_individual_assistance'
    | 'fema_insurance_guidance';
  label: string;
  publisher: string;
  url: string;
  badge: 'Official resource';
  verifiedAt: 'Verified Sep 2, 2026';
};

export const RESOURCE_CATALOG: ReadonlyArray<ResourceEntry> = [
  {
    id: 'ready_critical_documents',
    label: 'Ready.gov — Safeguard Critical Documents and Valuables',
    publisher: 'Ready.gov',
    url: 'https://www.ready.gov/collection/safeguard-critical-documents-valuables',
    badge: 'Official resource',
    verifiedAt: 'Verified Sep 2, 2026',
  },
  {
    id: 'redcross_damage_inventory',
    label: 'American Red Cross — Recovering Financially',
    publisher: 'American Red Cross',
    url: 'https://www.redcross.org/get-help/disaster-relief-and-recovery-services/recovering-financially.html',
    badge: 'Official resource',
    verifiedAt: 'Verified Sep 2, 2026',
  },
  {
    id: 'fema_individual_assistance',
    label: 'FEMA — Individual Assistance',
    publisher: 'FEMA',
    url: 'https://www.fema.gov/assistance/individual',
    badge: 'Official resource',
    verifiedAt: 'Verified Sep 2, 2026',
  },
  {
    id: 'fema_insurance_guidance',
    label: 'FEMA — Help for Survivors with Insurance',
    publisher: 'FEMA',
    url: 'https://www.fema.gov/fact-sheet/help-survivors-insurance-0',
    badge: 'Official resource',
    verifiedAt: 'Verified Sep 2, 2026',
  },
] as const;

export const RESOURCE_IDS = RESOURCE_CATALOG.map((resource) => resource.id);

const RESOURCE_LOOKUP = new Map(RESOURCE_CATALOG.map((resource) => [resource.id, resource]));

export function isKnownResourceId(value: string): value is ResourceEntry['id'] {
  return RESOURCE_IDS.includes(value as ResourceEntry['id']);
}

export function getResourceById(id: string): ResourceEntry | null {
  return RESOURCE_LOOKUP.get(id as ResourceEntry['id']) ?? null;
}
