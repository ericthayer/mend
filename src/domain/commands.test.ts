import { beforeEach, describe, expect, it } from 'vitest';
import { createRecoveryCommands } from './commands';
import { createEmptyDomainState, type CommandContext } from './types';
import { getCurrentDomainState, replaceDomainState } from '../state/recoveryStore';

function context(partial?: Partial<CommandContext>): CommandContext {
  return {
    actor: 'user',
    source: 'ui',
    ...partial,
  };
}

describe('recovery commands invariants', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());
  });

  it('creates active cases and appends activity events', () => {
    const commands = createRecoveryCommands();

    const result = commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and we are safe now.',
        safetyStatus: 'confirmed_safe',
        householdNeeds: ['mobility'],
      },
      context()
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.status).toBe('active');
    const state = getCurrentDomainState();
    expect(state.activity).toHaveLength(1);
    expect(state.activity[0].actor).toBe('user');
    expect(state.activity[0].source).toBe('ui');
  });

  it('blocks plan staging and outreach drafts when safety is not confirmed', () => {
    const commands = createRecoveryCommands();

    commands.createCase(
      {
        incidentType: 'other',
        summary: 'We are not fully sure whether immediate danger has passed yet.',
        safetyStatus: 'unknown',
      },
      context()
    );

    const stagePlan = commands.stagePlan(
      {
        goal: 'Create a first plan',
        tasks: [
          {
            title: 'Document damage',
            category: 'documentation',
            priority: 'now',
            rationale: 'Creates a baseline record for next steps.',
          },
        ],
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'stage_recovery_plan' })
    );

    expect(stagePlan.ok).toBe(false);
    if (!stagePlan.ok) {
      expect(stagePlan.code).toBe('safety_blocked');
    }

    const stageDraft = commands.stageOutreachDraft(
      {
        audience: 'landlord',
        subject: 'Quick summary',
        body: 'We are still unsafe and cannot proceed with planning yet.',
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'stage_outreach_draft' })
    );

    expect(stageDraft.ok).toBe(false);
    if (!stageDraft.ok) {
      expect(stageDraft.code).toBe('safety_blocked');
    }
  });

  it('rejects duplicate normalized task titles', () => {
    const commands = createRecoveryCommands();

    commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      context()
    );

    const result = commands.stagePlan(
      {
        goal: 'Create a focused plan',
        tasks: [
          {
            title: 'Call landlord',
            category: 'communication',
            priority: 'now',
            rationale: 'Confirm access and remediation expectations.',
          },
          {
            title: '  call   landlord  ',
            category: 'communication',
            priority: 'next',
            rationale: 'Duplicate title should fail after normalization.',
          },
        ],
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'stage_recovery_plan' })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('validation_error');
      expect(result.fieldErrors?.tasks).toContain('Duplicate task title');
    }
  });

  it('rejects ungrounded task due dates', () => {
    const commands = createRecoveryCommands();

    commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      context()
    );

    const result = commands.stagePlan(
      {
        goal: 'Create immediate next steps',
        tasks: [
          {
            title: 'Gather documents',
            category: 'documentation',
            priority: 'now',
            rationale: 'Organizes information for follow-up work.',
            dueAt: '2026-09-05',
          },
        ],
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'stage_recovery_plan' })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('validation_error');
      expect(result.fieldErrors?.['tasks.0.dueAt']).toContain('not grounded');
    }
  });

  it('rejects agent review attempts and stale pending plan ids', () => {
    const commands = createRecoveryCommands();

    commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      context()
    );

    const staged = commands.stagePlan(
      {
        goal: 'Create immediate next steps',
        tasks: [
          {
            title: 'Photograph damaged areas',
            category: 'documentation',
            priority: 'now',
            rationale: 'Provides evidence for communications and records.',
          },
        ],
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'stage_recovery_plan' })
    );

    expect(staged.ok).toBe(true);
    if (!staged.ok) {
      return;
    }

    const agentReview = commands.reviewPlan(
      {
        planId: staged.data.id,
        decision: 'approve',
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'start_plan_review' })
    );

    expect(agentReview.ok).toBe(false);
    if (!agentReview.ok) {
      expect(agentReview.code).toBe('state_conflict');
    }

    const staleReview = commands.reviewPlan(
      {
        planId: crypto.randomUUID(),
        decision: 'approve',
      },
      context({ actor: 'user', source: 'ui' })
    );

    expect(staleReview.ok).toBe(false);
    if (!staleReview.ok) {
      expect(staleReview.code).toBe('state_conflict');
    }
  });

  it('keeps approved plans immutable when staging revisions', () => {
    const commands = createRecoveryCommands();

    commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      context()
    );

    const first = commands.stagePlan(
      {
        goal: 'Initial plan',
        tasks: [
          {
            title: 'Capture key photos',
            category: 'documentation',
            priority: 'now',
            rationale: 'Supports future communications and claims conversations.',
          },
        ],
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'stage_recovery_plan' })
    );

    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }

    const approved = commands.reviewPlan(
      {
        planId: first.data.id,
        decision: 'approve',
      },
      context({ actor: 'user', source: 'ui' })
    );

    expect(approved.ok).toBe(true);
    if (!approved.ok) {
      return;
    }

    const revision = commands.stagePlan(
      {
        goal: 'Revised plan',
        tasks: [
          {
            title: 'Confirm temporary housing timeline',
            category: 'housing',
            priority: 'now',
            rationale: 'Housing deadline affects all other decisions.',
          },
        ],
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'stage_recovery_plan' })
    );

    expect(revision.ok).toBe(true);

    const state = getCurrentDomainState();
    const approvedPlan = state.plans.find((plan) => plan.id === first.data.id);
    const pendingPlan = state.plans.find((plan) => plan.status === 'pending_review');

    expect(approvedPlan?.status).toBe('approved');
    expect(pendingPlan).toBeDefined();
    expect(pendingPlan?.id).not.toBe(first.data.id);
  });

  it('rejects task status updates from webmcp source', () => {
    const commands = createRecoveryCommands();

    commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      context()
    );

    const staged = commands.stagePlan(
      {
        goal: 'Initial plan',
        tasks: [
          {
            title: 'Call landlord',
            category: 'communication',
            priority: 'now',
            rationale: 'Confirms immediate access and expected follow-up.',
          },
        ],
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'stage_recovery_plan' })
    );

    expect(staged.ok).toBe(true);
    if (!staged.ok) {
      return;
    }

    const task = staged.data.tasks[0];

    const result = commands.updateTaskStatus(
      {
        planId: staged.data.id,
        taskId: task.id,
        status: 'done',
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'update_task_status' })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('state_conflict');
    }
  });

  it('stages outreach drafts as unsent local drafts', () => {
    const commands = createRecoveryCommands();

    commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      context()
    );

    const result = commands.stageOutreachDraft(
      {
        audience: 'landlord',
        subject: 'Flood documentation update',
        body: 'I documented the flooded areas and can share details you requested.',
      },
      context({ actor: 'agent', source: 'webmcp', toolName: 'stage_outreach_draft' })
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.data.status).toBe('draft');
    expect(result.message).toContain('Draft');
  });
});
