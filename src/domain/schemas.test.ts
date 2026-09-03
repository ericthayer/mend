import { describe, expect, it } from 'vitest';
import {
  addRecordInputSchema,
  createCaseInputSchema,
  getRecoverySnapshotInputSchema,
  persistedStateSchema,
  reviewPlanInputSchema,
  stageOutreachDraftInputSchema,
  stagePlanInputSchema,
  updateTaskStatusInputSchema,
} from './schemas';

describe('imperative and command input schemas', () => {
  it('accepts valid get_recovery_snapshot input and rejects extra properties', () => {
    expect(getRecoverySnapshotInputSchema.safeParse({}).success).toBe(true);
    expect(getRecoverySnapshotInputSchema.safeParse({ includeActivity: true }).success).toBe(true);
    expect(
      getRecoverySnapshotInputSchema.safeParse({ includeActivity: false, extra: true }).success
    ).toBe(false);
  });

  it('accepts valid create_recovery_case input and rejects malformed payloads', () => {
    const valid = {
      incidentType: 'home_flood',
      summary: 'A burst pipe flooded the apartment and immediate danger has passed.',
      safetyStatus: 'confirmed_safe',
      occurredAt: '2026-09-02T10:30:00Z',
      locationLabel: 'home',
      householdNeeds: ['mobility', 'temporary_housing'],
    };

    expect(createCaseInputSchema.safeParse(valid).success).toBe(true);
    expect(
      createCaseInputSchema.safeParse({
        ...valid,
        safetyStatus: 'safe_now',
      }).success
    ).toBe(false);
    expect(
      createCaseInputSchema.safeParse({
        ...valid,
        summary: 'short',
      }).success
    ).toBe(false);
    expect(
      createCaseInputSchema.safeParse({
        ...valid,
        extra: 'nope',
      }).success
    ).toBe(false);
  });

  it('accepts valid add_case_record input and rejects invalid category/shape', () => {
    const valid = {
      category: 'communication',
      title: 'Landlord requested photos',
      note: 'Landlord requested updated room photos before Friday.',
      occurredAt: '2026-09-03',
      dueAt: '2026-09-05',
    };

    expect(addRecordInputSchema.safeParse(valid).success).toBe(true);
    expect(
      addRecordInputSchema.safeParse({
        ...valid,
        category: 'message',
      }).success
    ).toBe(false);
    expect(
      addRecordInputSchema.safeParse({
        ...valid,
        extra: true,
      }).success
    ).toBe(false);
  });

  it('accepts valid stage_recovery_plan input and rejects invalid bounds/enums', () => {
    const valid = {
      goal: 'Stabilize housing and documentation this week',
      tasks: [
        {
          title: 'Capture damage inventory',
          category: 'documentation',
          priority: 'now',
          rationale: 'A detailed inventory keeps communication grounded in facts.',
          sourceIds: ['ready_critical_documents'],
        },
      ],
    };

    expect(stagePlanInputSchema.safeParse(valid).success).toBe(true);
    expect(
      stagePlanInputSchema.safeParse({
        ...valid,
        tasks: [],
      }).success
    ).toBe(false);
    expect(
      stagePlanInputSchema.safeParse({
        ...valid,
        tasks: [
          {
            ...valid.tasks[0],
            priority: 'urgent',
          },
        ],
      }).success
    ).toBe(false);
    expect(
      stagePlanInputSchema.safeParse({
        ...valid,
        extra: true,
      }).success
    ).toBe(false);
  });

  it('accepts valid stage_outreach_draft input and rejects invalid audience/record shape', () => {
    const valid = {
      audience: 'landlord',
      subject: 'Flood update',
      body: 'I documented the flooded rooms and can share details you requested.',
      relatedRecordIds: ['record-1'],
    };

    expect(stageOutreachDraftInputSchema.safeParse(valid).success).toBe(true);
    expect(
      stageOutreachDraftInputSchema.safeParse({
        ...valid,
        audience: 'newspaper',
      }).success
    ).toBe(false);
    expect(
      stageOutreachDraftInputSchema.safeParse({
        ...valid,
        relatedRecordIds: new Array(11).fill('record-id'),
      }).success
    ).toBe(false);
  });

  it('accepts valid review input and rejects invalid decisions/extra fields', () => {
    const valid = {
      planId: crypto.randomUUID(),
      decision: 'approve',
      note: 'Looks good to proceed.',
      expectedUiStateVersion: 4,
    };

    expect(reviewPlanInputSchema.safeParse(valid).success).toBe(true);
    expect(
      reviewPlanInputSchema.safeParse({
        ...valid,
        decision: 'accept',
      }).success
    ).toBe(false);
    expect(
      reviewPlanInputSchema.safeParse({
        ...valid,
        expectedUiStateVersion: -1,
      }).success
    ).toBe(false);
    expect(
      reviewPlanInputSchema.safeParse({
        ...valid,
        extra: true,
      }).success
    ).toBe(false);
  });

  it('accepts valid task-status input and rejects invalid states', () => {
    const valid = {
      planId: crypto.randomUUID(),
      taskId: crypto.randomUUID(),
      status: 'in_progress',
    };

    expect(updateTaskStatusInputSchema.safeParse(valid).success).toBe(true);
    expect(
      updateTaskStatusInputSchema.safeParse({
        ...valid,
        status: 'completed',
      }).success
    ).toBe(false);
  });

  it('enforces persisted state shape and collection caps', () => {
    const valid = {
      schemaVersion: 1,
      uiStateVersion: 0,
      case: null,
      records: [],
      plans: [],
      drafts: [],
      activity: [],
    };

    expect(persistedStateSchema.safeParse(valid).success).toBe(true);
    expect(
      persistedStateSchema.safeParse({
        ...valid,
        extra: true,
      }).success
    ).toBe(false);
    expect(
      persistedStateSchema.safeParse({
        ...valid,
        activity: new Array(101).fill({}),
      }).success
    ).toBe(false);
  });
});
