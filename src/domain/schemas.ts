import { z } from 'zod';
import {
  HOUSEHOLD_NEEDS,
  INCIDENT_TYPES,
  OUTREACH_AUDIENCES,
  RECORD_CATEGORIES,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
} from './types';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const isoDateTimeRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?$/;

export function isIso8601String(value: string): boolean {
  if (isoDateRegex.test(value) || isoDateTimeRegex.test(value)) {
    const parsed = Date.parse(value);
    return !Number.isNaN(parsed);
  }

  return false;
}

const isoDateTimeStringSchema = z
  .string()
  .trim()
  .refine(isIso8601String, 'Expected ISO 8601 date or date-time.');

export const createCaseInputSchema = z
  .object({
    incidentType: z.enum(INCIDENT_TYPES),
    summary: z.string().trim().min(10).max(600),
    safetyStatus: z.enum(['confirmed_safe', 'needs_immediate_help', 'unknown']),
    occurredAt: isoDateTimeStringSchema.optional(),
    locationLabel: z.string().trim().max(120).optional(),
    householdNeeds: z.array(z.enum(HOUSEHOLD_NEEDS)).max(8).optional(),
  })
  .strict();

export const addRecordInputSchema = z
  .object({
    category: z.enum(RECORD_CATEGORIES),
    title: z.string().trim().min(3).max(100),
    note: z.string().trim().min(3).max(1000),
    occurredAt: isoDateTimeStringSchema.optional(),
    dueAt: isoDateTimeStringSchema.optional(),
  })
  .strict();

export const stagePlanTaskInputSchema = z
  .object({
    title: z.string().trim().min(3).max(100),
    category: z.enum(TASK_CATEGORIES),
    priority: z.enum(TASK_PRIORITIES),
    rationale: z.string().trim().min(5).max(240),
    dueAt: isoDateTimeStringSchema.optional(),
    sourceIds: z.array(z.string().trim().min(1)).max(3).optional(),
  })
  .strict();

export const stagePlanInputSchema = z
  .object({
    goal: z.string().trim().min(5).max(160),
    tasks: z.array(stagePlanTaskInputSchema).min(1).max(6),
  })
  .strict();

export const reviewPlanInputSchema = z
  .object({
    planId: z.string().trim().min(1),
    decision: z.enum(['approve', 'request_changes']),
    note: z.string().trim().max(500).optional(),
    expectedUiStateVersion: z.number().int().nonnegative().optional(),
  })
  .strict();

export const stageOutreachDraftInputSchema = z
  .object({
    audience: z.enum(OUTREACH_AUDIENCES),
    subject: z.string().trim().min(3).max(120),
    body: z.string().trim().min(10).max(2000),
    relatedRecordIds: z.array(z.string().trim().min(1)).max(10).optional(),
  })
  .strict();

export const updateTaskStatusInputSchema = z
  .object({
    planId: z.string().trim().min(1),
    taskId: z.string().trim().min(1),
    status: z.enum(['not_started', 'in_progress', 'done', 'blocked']),
  })
  .strict();

export const getRecoverySnapshotInputSchema = z
  .object({
    includeActivity: z.boolean().default(false).optional(),
  })
  .strict();

export const recoveryCaseSchema = z
  .object({
    id: z.string().uuid(),
    incidentType: z.enum(INCIDENT_TYPES),
    summary: z.string().trim().min(10).max(600),
    safetyStatus: z.enum(['confirmed_safe', 'needs_immediate_help', 'unknown']),
    status: z.enum(['active', 'paused_for_safety', 'closed']),
    occurredAt: isoDateTimeStringSchema.optional(),
    locationLabel: z.string().trim().max(120).optional(),
    householdNeeds: z.array(z.enum(HOUSEHOLD_NEEDS)).max(8),
    createdAt: isoDateTimeStringSchema,
    updatedAt: isoDateTimeStringSchema,
  })
  .strict();

export const caseRecordSchema = z
  .object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    category: z.enum(RECORD_CATEGORIES),
    title: z.string().trim().min(3).max(100),
    note: z.string().trim().min(3).max(1000),
    occurredAt: isoDateTimeStringSchema.optional(),
    dueAt: isoDateTimeStringSchema.optional(),
    createdBy: z.enum(['user', 'agent', 'system']),
    createdAt: isoDateTimeStringSchema,
  })
  .strict();

export const recoveryTaskSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().trim().min(3).max(100),
    category: z.enum(TASK_CATEGORIES),
    priority: z.enum(TASK_PRIORITIES),
    rationale: z.string().trim().min(5).max(240),
    dueAt: isoDateTimeStringSchema.optional(),
    sourceIds: z.array(z.string().trim().min(1)).max(3),
    status: z.enum(['not_started', 'in_progress', 'done', 'blocked']),
  })
  .strict();

export const recoveryPlanSchema = z
  .object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    version: z.number().int().positive(),
    goal: z.string().trim().min(5).max(160),
    status: z.enum(['pending_review', 'approved', 'changes_requested', 'superseded']),
    tasks: z.array(recoveryTaskSchema).min(1).max(6),
    proposedBy: z.enum(['user', 'agent', 'system']),
    reviewNote: z.string().trim().max(500).optional(),
    createdAt: isoDateTimeStringSchema,
    reviewedAt: isoDateTimeStringSchema.optional(),
  })
  .strict();

export const outreachDraftSchema = z
  .object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    audience: z.enum(OUTREACH_AUDIENCES),
    subject: z.string().trim().min(3).max(120),
    body: z.string().trim().min(10).max(2000),
    relatedRecordIds: z.array(z.string().trim().min(1)).max(10),
    status: z.literal('draft'),
    createdBy: z.enum(['user', 'agent', 'system']),
    createdAt: isoDateTimeStringSchema,
  })
  .strict();

export const activityEventSchema = z
  .object({
    id: z.string().uuid(),
    caseId: z.string().uuid().optional(),
    actor: z.enum(['user', 'agent', 'system']),
    source: z.enum(['ui', 'webmcp', 'seed']),
    action: z.string().trim().min(3).max(80),
    entityType: z.enum(['case', 'record', 'plan', 'task', 'draft', 'system']),
    entityId: z.string().uuid().optional(),
    toolName: z.string().trim().min(1).max(100).optional(),
    summary: z.string().trim().min(3).max(240),
    createdAt: isoDateTimeStringSchema,
  })
  .strict();

export const persistedStateSchema = z
  .object({
    schemaVersion: z.literal(1),
    uiStateVersion: z.number().int().nonnegative(),
    case: recoveryCaseSchema.nullable(),
    records: z.array(caseRecordSchema).max(50),
    plans: z.array(recoveryPlanSchema).max(10),
    drafts: z.array(outreachDraftSchema).max(20),
    activity: z.array(activityEventSchema).max(100),
  })
  .strict();

export type CreateCaseInput = z.infer<typeof createCaseInputSchema>;
export type AddRecordInput = z.infer<typeof addRecordInputSchema>;
export type StagePlanInput = z.infer<typeof stagePlanInputSchema>;
export type StagePlanTaskInput = z.infer<typeof stagePlanTaskInputSchema>;
export type ReviewPlanInput = z.infer<typeof reviewPlanInputSchema>;
export type StageOutreachDraftInput = z.infer<typeof stageOutreachDraftInputSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusInputSchema>;
export type PersistedState = z.infer<typeof persistedStateSchema>;
