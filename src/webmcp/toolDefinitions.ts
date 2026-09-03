import { getRecoverySnapshotInputSchema } from '../domain/schemas';
import { selectAllowedActions, selectSnapshot } from '../domain/selectors';
import type {
  AllowedAction,
  RecoveryCommands,
  RecoveryDomainState,
} from '../domain/types';
import { getCurrentDomainState } from '../state/recoveryStore';
import type { RecoveryToolDefinition } from './modelContextAdapter';
import { fromCommandResult, toToolFailure, toToolSuccess, type ToolResult } from './toolResults';

const GET_RECOVERY_SNAPSHOT_SCHEMA = {
  type: 'object',
  properties: {
    includeActivity: {
      type: 'boolean',
      default: false,
      description: 'Include up to the 10 most recent activity entries.',
    },
  },
  additionalProperties: false,
} as const;

const CREATE_RECOVERY_CASE_SCHEMA = {
  type: 'object',
  properties: {
    incidentType: {
      type: 'string',
      enum: ['home_flood', 'home_fire', 'severe_weather', 'temporary_displacement', 'other'],
      description: "The closest incident category based on the person's own description.",
    },
    summary: {
      type: 'string',
      minLength: 10,
      maxLength: 600,
      description: 'A factual plain-language summary without added assumptions.',
    },
    safetyStatus: {
      type: 'string',
      enum: ['confirmed_safe', 'needs_immediate_help', 'unknown'],
      description: 'Use confirmed_safe only when the person explicitly says immediate danger has passed.',
    },
    occurredAt: {
      type: 'string',
      description: 'Optional ISO 8601 date or date-time stated by the person.',
    },
    locationLabel: {
      type: 'string',
      maxLength: 120,
      description: "Optional non-sensitive label such as 'home' or a city; do not request a full street address.",
    },
    householdNeeds: {
      type: 'array',
      maxItems: 8,
      uniqueItems: true,
      items: {
        type: 'string',
        enum: [
          'accessible_housing',
          'mobility',
          'medication_continuity',
          'childcare',
          'pet_care',
          'transportation',
          'language_access',
          'temporary_housing',
          'other',
        ],
      },
    },
  },
  required: ['incidentType', 'summary', 'safetyStatus'],
  additionalProperties: false,
} as const;

const ADD_CASE_RECORD_SCHEMA = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['damage', 'communication', 'expense', 'housing', 'document', 'insurance', 'deadline'],
    },
    title: { type: 'string', minLength: 3, maxLength: 100 },
    note: {
      type: 'string',
      minLength: 3,
      maxLength: 1000,
      description: 'Plain text only. Preserve uncertainty rather than filling missing facts.',
    },
    occurredAt: { type: 'string', description: 'Optional ISO 8601 date or date-time.' },
    dueAt: {
      type: 'string',
      description: 'Optional ISO 8601 date or date-time for an explicitly stated deadline.',
    },
  },
  required: ['category', 'title', 'note'],
  additionalProperties: false,
} as const;

const STAGE_RECOVERY_PLAN_SCHEMA = {
  type: 'object',
  properties: {
    goal: { type: 'string', minLength: 5, maxLength: 160 },
    tasks: {
      type: 'array',
      minItems: 1,
      maxItems: 6,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 100 },
          category: {
            type: 'string',
            enum: ['safety', 'housing', 'documentation', 'insurance', 'financial', 'communication', 'services'],
          },
          priority: { type: 'string', enum: ['now', 'next', 'later'] },
          rationale: {
            type: 'string',
            minLength: 5,
            maxLength: 240,
            description: 'Why the task helps, tied to a case fact or clearly labeled general guidance.',
          },
          dueAt: {
            type: 'string',
            description: 'Optional ISO 8601 date or date-time based only on a known deadline.',
          },
          sourceIds: {
            type: 'array',
            maxItems: 3,
            uniqueItems: true,
            items: {
              type: 'string',
              enum: [
                'ready_critical_documents',
                'redcross_damage_inventory',
                'fema_individual_assistance',
                'fema_insurance_guidance',
              ],
            },
          },
        },
        required: ['title', 'category', 'priority', 'rationale'],
        additionalProperties: false,
      },
    },
  },
  required: ['goal', 'tasks'],
  additionalProperties: false,
} as const;

const CORE_IMPERATIVE_ACTIONS: AllowedAction[] = [
  'get_recovery_snapshot',
  'create_recovery_case',
  'add_case_record',
  'stage_recovery_plan',
];

const CORE_IMPERATIVE_ACTIONS_SET = new Set<AllowedAction>(CORE_IMPERATIVE_ACTIONS);

function nextSuggestedTools(state: RecoveryDomainState): string[] {
  return selectAllowedActions(state).filter((action) => CORE_IMPERATIVE_ACTIONS_SET.has(action));
}

function parseSnapshotInput(input: unknown, state: RecoveryDomainState): ToolResult<never> | null {
  const parsed = getRecoverySnapshotInputSchema.safeParse(input ?? {});

  if (parsed.success) {
    return null;
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.join('.') || 'input';
    fieldErrors[key] = issue.message;
  }

  return toToolFailure({
    code: 'validation_error',
    message: 'Some fields need correction before this action can continue.',
    retryable: true,
    fieldErrors,
    uiStateVersion: state.uiStateVersion,
  });
}

export function createRecoveryImperativeTools(commands: RecoveryCommands): RecoveryToolDefinition[] {
  return [
    {
      name: 'get_recovery_snapshot',
      description:
        'Returns the current local recovery case, its latest plan state, important records, household constraints, and allowed next actions. Use this before proposing changes or answering questions about the case.',
      inputSchema: GET_RECOVERY_SNAPSHOT_SCHEMA,
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: true,
      },
      execute: async (input) => {
        const state = getCurrentDomainState();
        const parseFailure = parseSnapshotInput(input, state);
        if (parseFailure) {
          return parseFailure;
        }

        const parsed = getRecoverySnapshotInputSchema.parse(input ?? {});
        const snapshot = selectSnapshot(state, {
          includeActivity: parsed.includeActivity,
        });

        return toToolSuccess({
          message: 'Snapshot ready. You can use the suggested tools for the next step.',
          data: snapshot,
          uiStateVersion: state.uiStateVersion,
          nextSuggestedTools: nextSuggestedTools(state),
        });
      },
    },
    {
      name: 'create_recovery_case',
      description:
        'Creates a local recovery case from facts the person supplied. Use after the person describes a household disruption and explicitly states whether immediate safety is resolved. This organizes information only and does not contact anyone or apply for services.',
      inputSchema: CREATE_RECOVERY_CASE_SCHEMA,
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: true,
      },
      execute: async (input, options) => {
        const result = commands.createCase(input, {
          actor: 'agent',
          source: 'webmcp',
          toolName: 'create_recovery_case',
          signal: options?.signal,
        });

        const state = getCurrentDomainState();
        return fromCommandResult(result, nextSuggestedTools(state));
      },
    },
    {
      name: 'add_case_record',
      description:
        'Adds one factual record to the active case, such as damage observed, a communication received, an expense, a housing detail, a document, an insurance detail, or a deadline. Use only information the person supplied or confirmed.',
      inputSchema: ADD_CASE_RECORD_SCHEMA,
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: true,
      },
      execute: async (input, options) => {
        const result = commands.addRecord(input, {
          actor: 'agent',
          source: 'webmcp',
          toolName: 'add_case_record',
          signal: options?.signal,
        });

        const state = getCurrentDomainState();
        return fromCommandResult(result, nextSuggestedTools(state));
      },
    },
    {
      name: 'stage_recovery_plan',
      description:
        'Stages a prioritized recovery plan for the person to review. Use after reading the current case. This creates a pending proposal only; it cannot approve the plan, perform tasks, contact third parties, or determine eligibility.',
      inputSchema: STAGE_RECOVERY_PLAN_SCHEMA,
      annotations: {
        readOnlyHint: false,
        untrustedContentHint: true,
      },
      execute: async (input, options) => {
        const result = commands.stagePlan(input, {
          actor: 'agent',
          source: 'webmcp',
          toolName: 'stage_recovery_plan',
          signal: options?.signal,
        });

        const state = getCurrentDomainState();
        return fromCommandResult(result, nextSuggestedTools(state));
      },
    },
  ];
}

export function selectStateAwareImperativeTools(
  state: RecoveryDomainState,
  tools: RecoveryToolDefinition[]
): RecoveryToolDefinition[] {
  const allowed = new Set(selectAllowedActions(state));

  return tools.filter((tool) => {
    if (!CORE_IMPERATIVE_ACTIONS_SET.has(tool.name as AllowedAction)) {
      return false;
    }

    return allowed.has(tool.name as AllowedAction);
  });
}
