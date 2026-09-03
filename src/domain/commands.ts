import {
  addRecordInputSchema,
  createCaseInputSchema,
  reviewPlanInputSchema,
  stageOutreachDraftInputSchema,
  stagePlanInputSchema,
  updateTaskStatusInputSchema,
} from './schemas';
import {
  appendActivityEvent,
  assertPendingPlanId,
  assertReviewAuthority,
  assertSafeForDrafting,
  assertSafeForPlanning,
  assertTaskStatusUpdateAuthority,
  containsHtmlLikeContent,
  findDuplicateNormalizedTaskTitle,
  isDueDateGrounded,
  normalizePlainText,
} from './invariants';
import {
  createEmptyDomainState,
  type CommandContext,
  type CommandFailure,
  type CommandResult,
  type RecoveryCommands,
  type RecoveryDomainState,
  type RecoveryPlan,
  type RecoveryTask,
} from './types';
import {
  getCurrentDomainState,
  resetDomainState,
  transactDomainState,
} from '../state/recoveryStore';
import { isKnownResourceId } from '../data/resources';

function nowIso(): string {
  return new Date().toISOString();
}

function nextUiStateVersion(state: RecoveryDomainState): number {
  return state.uiStateVersion + 1;
}

function ok<T>(
  state: RecoveryDomainState,
  data: T,
  message: string
): CommandResult<T> {
  return {
    ok: true,
    code: 'ok',
    message,
    data,
    uiStateVersion: state.uiStateVersion,
  };
}

function fail(
  state: RecoveryDomainState,
  input: Omit<CommandFailure, 'uiStateVersion'>
): CommandFailure {
  return {
    ...input,
    uiStateVersion: state.uiStateVersion,
  };
}

function parseOrValidationFail<T>(
  schemaResult: { success: true; data: T } | { success: false; error: { issues: Array<{ path: Array<string | number>; message: string }> } },
  state: RecoveryDomainState
): { ok: true; data: T } | { ok: false; failure: CommandFailure } {
  if (schemaResult.success) {
    return { ok: true, data: schemaResult.data };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of schemaResult.error.issues) {
    const key = issue.path.join('.') || 'input';
    fieldErrors[key] = issue.message;
  }

  return {
    ok: false,
    failure: fail(state, {
      ok: false,
      code: 'validation_error',
      message: 'Some fields need correction before this action can continue.',
      retryable: true,
      fieldErrors,
    }),
  };
}

function withActivity(
  state: RecoveryDomainState,
  context: CommandContext,
  details: {
    caseId?: string;
    action: string;
    entityType: 'case' | 'record' | 'plan' | 'task' | 'draft' | 'system';
    entityId?: string;
    summary: string;
  }
): RecoveryDomainState {
  return appendActivityEvent(state, {
    caseId: details.caseId,
    actor: context.actor,
    source: context.source,
    action: details.action,
    entityType: details.entityType,
    entityId: details.entityId,
    toolName: context.toolName,
    summary: details.summary,
  });
}

function supersedeExistingPendingPlans(state: RecoveryDomainState): RecoveryDomainState {
  const plans = state.plans.map((plan) =>
    plan.status === 'pending_review' ? { ...plan, status: 'superseded' as const } : plan
  );

  return {
    ...state,
    plans,
  };
}

function buildTask(taskInput: {
  title: string;
  category: RecoveryTask['category'];
  priority: RecoveryTask['priority'];
  rationale: string;
  dueAt?: string;
  sourceIds?: string[];
}): RecoveryTask {
  return {
    id: crypto.randomUUID(),
    title: normalizePlainText(taskInput.title),
    category: taskInput.category,
    priority: taskInput.priority,
    rationale: normalizePlainText(taskInput.rationale),
    dueAt: taskInput.dueAt,
    sourceIds: (taskInput.sourceIds ?? []).filter(isKnownResourceId),
    status: 'not_started',
  };
}

function buildPlanVersion(state: RecoveryDomainState): number {
  const plansForCase = state.case
    ? state.plans.filter((plan) => plan.caseId === state.case?.id)
    : [];

  if (plansForCase.length === 0) {
    return 1;
  }

  return Math.max(...plansForCase.map((plan) => plan.version)) + 1;
}

export function createRecoveryCommands(): RecoveryCommands {
  const createCase: RecoveryCommands['createCase'] = (input, context) => {
    const current = getCurrentDomainState();
    const parsed = parseOrValidationFail(createCaseInputSchema.safeParse(input), current);
    if (!parsed.ok) {
      return parsed.failure;
    }

    let commandResult: CommandResult<ReturnType<typeof createRecoveryCaseEntity>> = fail(current, {
      ok: false,
      code: 'internal_error',
      message: 'Failed to create case.',
      retryable: true,
    });

    transactDomainState((state) => {
      const now = nowIso();
      const caseEntity = createRecoveryCaseEntity(parsed.data, now);
      let next: RecoveryDomainState = {
        ...state,
        case: caseEntity,
        records: [],
        plans: [],
        drafts: [],
        uiStateVersion: nextUiStateVersion(state),
      };

      next = withActivity(next, context, {
        caseId: caseEntity.id,
        action: 'create_case',
        entityType: 'case',
        entityId: caseEntity.id,
        summary:
          caseEntity.status === 'paused_for_safety'
            ? 'Created a safety-paused case. Planning is blocked until safety is confirmed.'
            : 'Created a recovery case and saved the initial facts.',
      });

      commandResult = ok(
        next,
        caseEntity,
        caseEntity.status === 'paused_for_safety'
          ? 'Case created in safety-pause mode. Focus on immediate safety first.'
          : 'Case created. You can now add records or stage a plan.'
      );

      return next;
    });

    return commandResult;
  };

  const addRecord: RecoveryCommands['addRecord'] = (input, context) => {
    const current = getCurrentDomainState();
    const parsed = parseOrValidationFail(addRecordInputSchema.safeParse(input), current);
    if (!parsed.ok) {
      return parsed.failure;
    }

    if (!current.case) {
      return fail(current, {
        ok: false,
        code: 'state_conflict',
        message: 'Start or load a case before adding records.',
        retryable: true,
      });
    }

    let result: CommandResult<(typeof current.records)[number]> = fail(current, {
      ok: false,
      code: 'internal_error',
      message: 'Failed to add record.',
      retryable: true,
    });

    transactDomainState((state) => {
      if (!state.case) {
        result = fail(state, {
          ok: false,
          code: 'state_conflict',
          message: 'No active case found.',
          retryable: true,
        });
        return state;
      }

      const record = {
        id: crypto.randomUUID(),
        caseId: state.case.id,
        category: parsed.data.category,
        title: normalizePlainText(parsed.data.title),
        note: normalizePlainText(parsed.data.note),
        occurredAt: parsed.data.occurredAt,
        dueAt: parsed.data.dueAt,
        createdBy: context.actor,
        createdAt: nowIso(),
      };

      const records = [...state.records, record].slice(-50);
      let next: RecoveryDomainState = {
        ...state,
        records,
        case: {
          ...state.case,
          updatedAt: nowIso(),
        },
        uiStateVersion: nextUiStateVersion(state),
      };

      next = withActivity(next, context, {
        caseId: state.case.id,
        action: 'add_record',
        entityType: 'record',
        entityId: record.id,
        summary: `Added ${record.category} record: ${record.title}`,
      });

      result = ok(next, record, 'Record added to the case timeline.');
      return next;
    });

    return result;
  };

  const stagePlan: RecoveryCommands['stagePlan'] = (input, context) => {
    const current = getCurrentDomainState();
    const parsed = parseOrValidationFail(stagePlanInputSchema.safeParse(input), current);
    if (!parsed.ok) {
      return parsed.failure;
    }

    const safetyFailure = assertSafeForPlanning(current);
    if (safetyFailure) {
      return {
        ...safetyFailure,
        uiStateVersion: current.uiStateVersion,
      };
    }

    const duplicateTitle = findDuplicateNormalizedTaskTitle(parsed.data.tasks.map((task) => task.title));
    if (duplicateTitle) {
      return fail(current, {
        ok: false,
        code: 'validation_error',
        message: 'Task titles must be unique within a staged plan.',
        retryable: true,
        fieldErrors: {
          tasks: `Duplicate task title detected: ${duplicateTitle}`,
        },
      });
    }

    for (const [index, task] of parsed.data.tasks.entries()) {
      if (containsHtmlLikeContent(task.title) || containsHtmlLikeContent(task.rationale)) {
        return fail(current, {
          ok: false,
          code: 'validation_error',
          message: 'Task text must be plain text without HTML-like markup.',
          retryable: true,
          fieldErrors: {
            [`tasks.${index}`]: 'Use plain text only.',
          },
        });
      }

      if (task.dueAt && !isDueDateGrounded(task.dueAt, current)) {
        return fail(current, {
          ok: false,
          code: 'validation_error',
          message:
            'A task due date must match an explicit deadline record. Omit dueAt or add the factual deadline record first.',
          retryable: true,
          fieldErrors: {
            [`tasks.${index}.dueAt`]: 'Due date is not grounded in case records.',
          },
        });
      }
    }

    let result: CommandResult<RecoveryPlan> = fail(current, {
      ok: false,
      code: 'internal_error',
      message: 'Failed to stage plan.',
      retryable: true,
    });

    transactDomainState((state) => {
      if (!state.case) {
        result = fail(state, {
          ok: false,
          code: 'state_conflict',
          message: 'No active case found.',
          retryable: true,
        });
        return state;
      }

      let next = supersedeExistingPendingPlans(state);

      const plan: RecoveryPlan = {
        id: crypto.randomUUID(),
        caseId: state.case.id,
        version: buildPlanVersion(next),
        goal: normalizePlainText(parsed.data.goal),
        status: 'pending_review',
        tasks: parsed.data.tasks.map((task) =>
          buildTask({
            title: task.title,
            category: task.category,
            priority: task.priority,
            rationale: task.rationale,
            dueAt: task.dueAt,
            sourceIds: task.sourceIds,
          })
        ),
        proposedBy: context.actor,
        createdAt: nowIso(),
      };

      next = {
        ...next,
        plans: [...next.plans, plan].slice(-10),
        case: {
          ...state.case,
          updatedAt: nowIso(),
        },
        uiStateVersion: nextUiStateVersion(next),
      };

      next = withActivity(next, context, {
        caseId: state.case.id,
        action: 'stage_plan',
        entityType: 'plan',
        entityId: plan.id,
        summary: `Staged plan v${plan.version} with ${plan.tasks.length} tasks. Needs human review.`,
      });

      result = ok(
        next,
        plan,
        'Plan staged for review. A person must approve or request changes manually.'
      );

      return next;
    });

    return result;
  };

  const reviewPlan: RecoveryCommands['reviewPlan'] = (input, context) => {
    const current = getCurrentDomainState();
    const parsed = parseOrValidationFail(reviewPlanInputSchema.safeParse(input), current);
    if (!parsed.ok) {
      return parsed.failure;
    }

    const authorityFailure = assertReviewAuthority(context);
    if (authorityFailure) {
      return {
        ...authorityFailure,
        uiStateVersion: current.uiStateVersion,
      };
    }

    const pendingFailure = assertPendingPlanId(
      current,
      parsed.data.planId,
      parsed.data.expectedUiStateVersion
    );
    if (pendingFailure) {
      return pendingFailure;
    }

    let result: CommandResult<RecoveryPlan> = fail(current, {
      ok: false,
      code: 'internal_error',
      message: 'Failed to review plan.',
      retryable: true,
    });

    transactDomainState((state) => {
      const pendingIndex = state.plans.findIndex((plan) => plan.id === parsed.data.planId);
      if (pendingIndex < 0) {
        result = fail(state, {
          ok: false,
          code: 'not_found',
          message: 'Pending plan not found.',
          retryable: true,
        });
        return state;
      }

      const pending = state.plans[pendingIndex];
      if (pending.status !== 'pending_review') {
        result = fail(state, {
          ok: false,
          code: 'state_conflict',
          message: 'Only pending plans can be reviewed.',
          retryable: true,
        });
        return state;
      }

      const reviewed: RecoveryPlan = {
        ...pending,
        status: parsed.data.decision === 'approve' ? 'approved' : 'changes_requested',
        reviewNote: parsed.data.note ? normalizePlainText(parsed.data.note) : pending.reviewNote,
        reviewedAt: nowIso(),
      };

      const plans = [...state.plans];
      plans[pendingIndex] = reviewed;

      let next: RecoveryDomainState = {
        ...state,
        plans,
        case: state.case
          ? {
              ...state.case,
              updatedAt: nowIso(),
            }
          : state.case,
        uiStateVersion: nextUiStateVersion(state),
      };

      next = withActivity(next, context, {
        caseId: reviewed.caseId,
        action: parsed.data.decision === 'approve' ? 'approve_plan' : 'request_plan_changes',
        entityType: 'plan',
        entityId: reviewed.id,
        summary:
          parsed.data.decision === 'approve'
            ? `Approved plan v${reviewed.version}.`
            : `Requested changes for plan v${reviewed.version}.`,
      });

      result = ok(
        next,
        reviewed,
        parsed.data.decision === 'approve'
          ? 'Plan approved. Next actions are now active.'
          : 'Plan marked for changes. A revised proposal can be staged.'
      );

      return next;
    });

    return result;
  };

  const stageOutreachDraft: RecoveryCommands['stageOutreachDraft'] = (input, context) => {
    const current = getCurrentDomainState();
    const parsed = parseOrValidationFail(stageOutreachDraftInputSchema.safeParse(input), current);
    if (!parsed.ok) {
      return parsed.failure;
    }

    const safetyFailure = assertSafeForDrafting(current);
    if (safetyFailure) {
      return {
        ...safetyFailure,
        uiStateVersion: current.uiStateVersion,
      };
    }

    if (containsHtmlLikeContent(parsed.data.subject) || containsHtmlLikeContent(parsed.data.body)) {
      return fail(current, {
        ok: false,
        code: 'validation_error',
        message: 'Draft subject and body must be plain text without HTML-like markup.',
        retryable: true,
      });
    }

    if (parsed.data.relatedRecordIds?.length) {
      const knownRecordIds = new Set(current.records.map((record) => record.id));
      const invalidId = parsed.data.relatedRecordIds.find((id) => !knownRecordIds.has(id));
      if (invalidId) {
        return fail(current, {
          ok: false,
          code: 'validation_error',
          message: 'One or more relatedRecordIds are not present in the current case.',
          retryable: true,
          fieldErrors: {
            relatedRecordIds: `Unknown record ID: ${invalidId}`,
          },
        });
      }
    }

    let result: CommandResult<(typeof current.drafts)[number]> = fail(current, {
      ok: false,
      code: 'internal_error',
      message: 'Failed to stage outreach draft.',
      retryable: true,
    });

    transactDomainState((state) => {
      if (!state.case) {
        result = fail(state, {
          ok: false,
          code: 'state_conflict',
          message: 'No active case found.',
          retryable: true,
        });
        return state;
      }

      const draft = {
        id: crypto.randomUUID(),
        caseId: state.case.id,
        audience: parsed.data.audience,
        subject: normalizePlainText(parsed.data.subject),
        body: normalizePlainText(parsed.data.body),
        relatedRecordIds: parsed.data.relatedRecordIds ?? [],
        status: 'draft' as const,
        createdBy: context.actor,
        createdAt: nowIso(),
      };

      let next: RecoveryDomainState = {
        ...state,
        drafts: [...state.drafts, draft].slice(-20),
        case: {
          ...state.case,
          updatedAt: nowIso(),
        },
        uiStateVersion: nextUiStateVersion(state),
      };

      next = withActivity(next, context, {
        caseId: state.case.id,
        action: 'stage_outreach_draft',
        entityType: 'draft',
        entityId: draft.id,
        summary: `Prepared a ${draft.audience} draft. Draft only — not sent.`,
      });

      result = ok(next, draft, 'Draft staged locally. Draft only — not sent.');
      return next;
    });

    return result;
  };

  const updateTaskStatus: RecoveryCommands['updateTaskStatus'] = (input, context) => {
    const current = getCurrentDomainState();
    const parsed = parseOrValidationFail(updateTaskStatusInputSchema.safeParse(input), current);
    if (!parsed.ok) {
      return parsed.failure;
    }

    const authorityFailure = assertTaskStatusUpdateAuthority(context);
    if (authorityFailure) {
      return {
        ...authorityFailure,
        uiStateVersion: current.uiStateVersion,
      };
    }

    let result: CommandResult<RecoveryTask> = fail(current, {
      ok: false,
      code: 'internal_error',
      message: 'Failed to update task status.',
      retryable: true,
    });

    transactDomainState((state) => {
      const planIndex = state.plans.findIndex((plan) => plan.id === parsed.data.planId);
      if (planIndex < 0) {
        result = fail(state, {
          ok: false,
          code: 'not_found',
          message: 'Plan not found.',
          retryable: true,
        });
        return state;
      }

      const plan = state.plans[planIndex];
      const taskIndex = plan.tasks.findIndex((task) => task.id === parsed.data.taskId);
      if (taskIndex < 0) {
        result = fail(state, {
          ok: false,
          code: 'not_found',
          message: 'Task not found.',
          retryable: true,
        });
        return state;
      }

      const updatedTask: RecoveryTask = {
        ...plan.tasks[taskIndex],
        status: parsed.data.status,
      };

      const updatedPlan: RecoveryPlan = {
        ...plan,
        tasks: plan.tasks.map((task, index) => (index === taskIndex ? updatedTask : task)),
      };

      const plans = [...state.plans];
      plans[planIndex] = updatedPlan;

      let next: RecoveryDomainState = {
        ...state,
        plans,
        case: state.case
          ? {
              ...state.case,
              updatedAt: nowIso(),
            }
          : state.case,
        uiStateVersion: nextUiStateVersion(state),
      };

      next = withActivity(next, context, {
        caseId: updatedPlan.caseId,
        action: 'update_task_status',
        entityType: 'task',
        entityId: updatedTask.id,
        summary: `Updated task status: ${updatedTask.title} → ${updatedTask.status}.`,
      });

      result = ok(next, updatedTask, 'Task status updated.');
      return next;
    });

    return result;
  };

  const resetLocalData: RecoveryCommands['resetLocalData'] = (_context) => {
    void _context;
    resetDomainState();
    const next = createEmptyDomainState();

    return {
      ok: true,
      code: 'ok',
      message: 'Local case data has been reset.',
      data: null,
      uiStateVersion: next.uiStateVersion,
    };
  };

  return {
    createCase,
    addRecord,
    stagePlan,
    reviewPlan,
    stageOutreachDraft,
    updateTaskStatus,
    resetLocalData,
  };
}

function createRecoveryCaseEntity(
  input: {
    incidentType: 'home_flood' | 'home_fire' | 'severe_weather' | 'temporary_displacement' | 'other';
    summary: string;
    safetyStatus: 'confirmed_safe' | 'needs_immediate_help' | 'unknown';
    occurredAt?: string;
    locationLabel?: string;
    householdNeeds?: Array<
      | 'accessible_housing'
      | 'mobility'
      | 'medication_continuity'
      | 'childcare'
      | 'pet_care'
      | 'transportation'
      | 'language_access'
      | 'temporary_housing'
      | 'other'
    >;
  },
  now: string
) {
  return {
    id: crypto.randomUUID(),
    incidentType: input.incidentType,
    summary: normalizePlainText(input.summary),
    safetyStatus: input.safetyStatus,
    status: input.safetyStatus === 'confirmed_safe' ? ('active' as const) : ('paused_for_safety' as const),
    occurredAt: input.occurredAt,
    locationLabel: input.locationLabel ? normalizePlainText(input.locationLabel) : undefined,
    householdNeeds: input.householdNeeds ?? [],
    createdAt: now,
    updatedAt: now,
  };
}
