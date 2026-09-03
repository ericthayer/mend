import type {
  ActivityEvent,
  AllowedAction,
  CommandContext,
  CommandFailure,
  RecoveryDomainState,
  RecoveryPlan,
} from './types';

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

const htmlLikePattern = /<\/?[a-z][\s\S]*>/i;

export function containsHtmlLikeContent(value: string): boolean {
  return htmlLikePattern.test(value);
}

export function normalizePlainText(value: string): string {
  return normalizeText(value);
}

export function ensureNotCancelled(signal?: AbortSignal): CommandFailure | null {
  if (signal?.aborted) {
    return {
      ok: false,
      code: 'cancelled',
      message: 'The operation was cancelled before it completed.',
      retryable: true,
      uiStateVersion: 0,
    };
  }

  return null;
}

export function getPendingPlan(state: RecoveryDomainState): RecoveryPlan | null {
  for (let index = state.plans.length - 1; index >= 0; index -= 1) {
    const plan = state.plans[index];
    if (plan.status === 'pending_review') {
      return plan;
    }
  }

  return null;
}

export function getLatestApprovedPlan(state: RecoveryDomainState): RecoveryPlan | null {
  for (let index = state.plans.length - 1; index >= 0; index -= 1) {
    const plan = state.plans[index];
    if (plan.status === 'approved') {
      return plan;
    }
  }

  return null;
}

export function assertSafeForPlanning(state: RecoveryDomainState): CommandFailure | null {
  if (!state.case) {
    return {
      ok: false,
      code: 'state_conflict',
      message: 'Create or load a case before staging a plan.',
      retryable: true,
      uiStateVersion: state.uiStateVersion,
    };
  }

  if (state.case.safetyStatus !== 'confirmed_safe') {
    return {
      ok: false,
      code: 'safety_blocked',
      message:
        'Planning is blocked until immediate safety is confirmed. Ask the person to focus on immediate help first.',
      retryable: true,
      uiStateVersion: state.uiStateVersion,
    };
  }

  if (state.case.status !== 'active') {
    return {
      ok: false,
      code: 'state_conflict',
      message: 'Planning is unavailable while the case is not active.',
      retryable: true,
      uiStateVersion: state.uiStateVersion,
    };
  }

  return null;
}

export function assertSafeForDrafting(state: RecoveryDomainState): CommandFailure | null {
  const planningCheck = assertSafeForPlanning(state);
  if (planningCheck) {
    return planningCheck;
  }

  return null;
}

export function findDuplicateNormalizedTaskTitle(titles: string[]): string | null {
  const seen = new Set<string>();

  for (const title of titles) {
    const normalized = normalizePlainText(title).toLocaleLowerCase();
    if (seen.has(normalized)) {
      return title;
    }
    seen.add(normalized);
  }

  return null;
}

export function isDueDateGrounded(
  dueAt: string | undefined,
  state: RecoveryDomainState
): boolean {
  if (!dueAt) {
    return true;
  }

  return state.records.some((record) => record.dueAt === dueAt);
}

export function sanitizeActivitySummary(summary: string): string {
  const collapsed = normalizePlainText(summary);
  if (collapsed.length <= 240) {
    return collapsed;
  }

  return `${collapsed.slice(0, 237)}...`;
}

export function appendActivityEvent(
  state: RecoveryDomainState,
  event: Omit<ActivityEvent, 'id' | 'createdAt' | 'summary'> & { summary: string }
): RecoveryDomainState {
  const createdAt = new Date().toISOString();

  const nextEvent: ActivityEvent = {
    id: crypto.randomUUID(),
    ...event,
    summary: sanitizeActivitySummary(event.summary),
    createdAt,
  };

  const nextActivity = [...state.activity, nextEvent];

  while (nextActivity.length > 100) {
    nextActivity.shift();
  }

  return {
    ...state,
    activity: nextActivity,
  };
}

export function assertReviewAuthority(context: CommandContext): CommandFailure | null {
  if (context.actor !== 'user') {
    return {
      ok: false,
      code: 'state_conflict',
      message: 'Only the person using the visible review controls can approve or request changes.',
      retryable: false,
      uiStateVersion: 0,
    };
  }

  return null;
}

export function assertTaskStatusUpdateAuthority(
  context: CommandContext
): CommandFailure | null {
  if (context.source === 'webmcp') {
    return {
      ok: false,
      code: 'state_conflict',
      message: 'Task status updates are available only from manual UI actions in this build.',
      retryable: false,
      uiStateVersion: 0,
    };
  }

  return null;
}

export function assertPendingPlanId(
  state: RecoveryDomainState,
  planId: string,
  expectedUiStateVersion?: number
): CommandFailure | null {
  if (typeof expectedUiStateVersion === 'number' && expectedUiStateVersion !== state.uiStateVersion) {
    return {
      ok: false,
      code: 'state_conflict',
      message:
        'The planner changed since this request was prepared. Reload the latest snapshot and try again.',
      retryable: true,
      uiStateVersion: state.uiStateVersion,
    };
  }

  const pending = getPendingPlan(state);

  if (!pending) {
    return {
      ok: false,
      code: 'state_conflict',
      message: 'There is no pending plan to review right now.',
      retryable: true,
      uiStateVersion: state.uiStateVersion,
    };
  }

  if (pending.id !== planId) {
    return {
      ok: false,
      code: 'state_conflict',
      message: 'That plan is stale. Use the current pending plan ID from a fresh snapshot.',
      retryable: true,
      uiStateVersion: state.uiStateVersion,
    };
  }

  return null;
}

export function deriveAllowedActions(state: RecoveryDomainState): AllowedAction[] {
  if (!state.case) {
    return ['get_recovery_snapshot', 'create_recovery_case'];
  }

  if (state.case.status === 'paused_for_safety' || state.case.safetyStatus !== 'confirmed_safe') {
    return ['get_recovery_snapshot'];
  }

  const hasPendingPlan = state.plans.some((plan) => plan.status === 'pending_review');

  if (hasPendingPlan) {
    return [
      'get_recovery_snapshot',
      'add_case_record',
      'stage_recovery_plan',
      'stage_outreach_draft',
      'start_plan_review',
    ];
  }

  return [
    'get_recovery_snapshot',
    'add_case_record',
    'stage_recovery_plan',
    'stage_outreach_draft',
  ];
}
