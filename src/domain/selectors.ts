import type {
  ActivityEvent,
  AllowedAction,
  CaseRecord,
  RecoveryCase,
  RecoveryDomainState,
  RecoveryPlan,
} from './types';
import { deriveAllowedActions, getLatestApprovedPlan, getPendingPlan } from './invariants';

function capText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

export type RecoverySnapshot = {
  case: RecoveryCase | null;
  latestApprovedPlan: RecoveryPlan | null;
  pendingPlan: RecoveryPlan | null;
  records: CaseRecord[];
  drafts: RecoveryDomainState['drafts'];
  activity?: ActivityEvent[];
  safetyBoundary: {
    status: RecoveryCase['safetyStatus'] | 'no_case';
    planningAllowed: boolean;
    message: string;
  };
  allowedActions: AllowedAction[];
};

function buildSafetyBoundary(caseData: RecoveryCase | null): RecoverySnapshot['safetyBoundary'] {
  if (!caseData) {
    return {
      status: 'no_case',
      planningAllowed: false,
      message: 'Start or load a case to begin planning.',
    };
  }

  if (caseData.safetyStatus !== 'confirmed_safe') {
    return {
      status: caseData.safetyStatus,
      planningAllowed: false,
      message:
        'Immediate safety is not confirmed. The app can organize facts, but planning and drafts are paused.',
    };
  }

  return {
    status: caseData.safetyStatus,
    planningAllowed: caseData.status === 'active',
    message:
      caseData.status === 'active'
        ? 'Planning is available. Review and approve changes manually before they become active.'
        : 'This case is not active for planning.',
  };
}

export function selectPendingPlan(state: RecoveryDomainState): RecoveryPlan | null {
  return getPendingPlan(state);
}

export function selectLatestApprovedPlan(state: RecoveryDomainState): RecoveryPlan | null {
  return getLatestApprovedPlan(state);
}

export function selectAllowedActions(state: RecoveryDomainState): AllowedAction[] {
  return deriveAllowedActions(state);
}

export function selectSnapshot(
  state: RecoveryDomainState,
  options?: { includeActivity?: boolean }
): RecoverySnapshot {
  const includeActivity = options?.includeActivity ?? false;

  return {
    case: state.case,
    latestApprovedPlan: selectLatestApprovedPlan(state),
    pendingPlan: selectPendingPlan(state),
    records: state.records.slice(-20).map((record) => ({
      ...record,
      note: capText(record.note, 320),
    })),
    drafts: state.drafts.slice(-10).map((draft) => ({
      ...draft,
      body: capText(draft.body, 500),
    })),
    activity: includeActivity ? state.activity.slice(-10) : undefined,
    safetyBoundary: buildSafetyBoundary(state.case),
    allowedActions: selectAllowedActions(state),
  };
}
