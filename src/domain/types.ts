export const INCIDENT_TYPES = [
  'home_flood',
  'home_fire',
  'severe_weather',
  'temporary_displacement',
  'other',
] as const;

export const HOUSEHOLD_NEEDS = [
  'accessible_housing',
  'mobility',
  'medication_continuity',
  'childcare',
  'pet_care',
  'transportation',
  'language_access',
  'temporary_housing',
  'other',
] as const;

export const RECORD_CATEGORIES = [
  'damage',
  'communication',
  'expense',
  'housing',
  'document',
  'insurance',
  'deadline',
] as const;

export const TASK_CATEGORIES = [
  'safety',
  'housing',
  'documentation',
  'insurance',
  'financial',
  'communication',
  'services',
] as const;

export const TASK_PRIORITIES = ['now', 'next', 'later'] as const;

export const OUTREACH_AUDIENCES = [
  'landlord',
  'property_manager',
  'insurer',
  'employer',
  'service_provider',
  'family_or_friend',
  'other',
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number];
export type HouseholdNeed = (typeof HOUSEHOLD_NEEDS)[number];
export type RecordCategory = (typeof RECORD_CATEGORIES)[number];
export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type OutreachAudience = (typeof OUTREACH_AUDIENCES)[number];

export type Actor = 'user' | 'agent' | 'system';
export type CommandSource = 'ui' | 'webmcp' | 'seed';

export type SafetyStatus = 'confirmed_safe' | 'needs_immediate_help' | 'unknown';
export type CaseStatus = 'active' | 'paused_for_safety' | 'closed';
export type PlanStatus = 'pending_review' | 'approved' | 'changes_requested' | 'superseded';
export type TaskStatus = 'not_started' | 'in_progress' | 'done' | 'blocked';

export type AllowedAction =
  | 'get_recovery_snapshot'
  | 'create_recovery_case'
  | 'add_case_record'
  | 'stage_recovery_plan'
  | 'stage_outreach_draft'
  | 'start_plan_review';

export interface RecoveryCase {
  id: string;
  incidentType: IncidentType;
  summary: string;
  safetyStatus: SafetyStatus;
  status: CaseStatus;
  occurredAt?: string;
  locationLabel?: string;
  householdNeeds: HouseholdNeed[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseRecord {
  id: string;
  caseId: string;
  category: RecordCategory;
  title: string;
  note: string;
  occurredAt?: string;
  dueAt?: string;
  createdBy: Actor;
  createdAt: string;
}

export interface RecoveryTask {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  rationale: string;
  dueAt?: string;
  sourceIds: string[];
  status: TaskStatus;
}

export interface RecoveryPlan {
  id: string;
  caseId: string;
  version: number;
  goal: string;
  status: PlanStatus;
  tasks: RecoveryTask[];
  proposedBy: Actor;
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface OutreachDraft {
  id: string;
  caseId: string;
  audience: OutreachAudience;
  subject: string;
  body: string;
  relatedRecordIds: string[];
  status: 'draft';
  createdBy: Actor;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  caseId?: string;
  actor: Actor;
  source: CommandSource;
  action: string;
  entityType: 'case' | 'record' | 'plan' | 'task' | 'draft' | 'system';
  entityId?: string;
  toolName?: string;
  summary: string;
  createdAt: string;
}

export interface RecoveryDomainState {
  schemaVersion: 1;
  uiStateVersion: number;
  case: RecoveryCase | null;
  records: CaseRecord[];
  plans: RecoveryPlan[];
  drafts: OutreachDraft[];
  activity: ActivityEvent[];
}

export interface CommandContext {
  actor: Actor;
  source: CommandSource;
  toolName?: string;
  signal?: AbortSignal;
}

export type CommandErrorCode =
  | 'validation_error'
  | 'state_conflict'
  | 'safety_blocked'
  | 'not_found'
  | 'cancelled'
  | 'internal_error';

export type CommandSuccess<T> = {
  ok: true;
  code: 'ok';
  message: string;
  data: T;
  uiStateVersion: number;
};

export type CommandFailure = {
  ok: false;
  code: CommandErrorCode;
  message: string;
  retryable: boolean;
  fieldErrors?: Record<string, string>;
  uiStateVersion: number;
};

export type CommandResult<T> = CommandSuccess<T> | CommandFailure;

export interface RecoveryCommands {
  createCase: (input: unknown, context: CommandContext) => CommandResult<RecoveryCase>;
  addRecord: (input: unknown, context: CommandContext) => CommandResult<CaseRecord>;
  stagePlan: (input: unknown, context: CommandContext) => CommandResult<RecoveryPlan>;
  reviewPlan: (input: unknown, context: CommandContext) => CommandResult<RecoveryPlan>;
  stageOutreachDraft: (input: unknown, context: CommandContext) => CommandResult<OutreachDraft>;
  updateTaskStatus: (input: unknown, context: CommandContext) => CommandResult<RecoveryTask>;
  resetLocalData: (context: CommandContext) => CommandResult<null>;
}

export function createEmptyDomainState(): RecoveryDomainState {
  return {
    schemaVersion: 1,
    uiStateVersion: 0,
    case: null,
    records: [],
    plans: [],
    drafts: [],
    activity: [],
  };
}
