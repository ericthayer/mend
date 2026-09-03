import { beforeEach, describe, expect, it } from 'vitest';
import { createRecoveryCommands } from '../domain/commands';
import { createEmptyDomainState } from '../domain/types';
import { getCurrentDomainState, replaceDomainState } from '../state/recoveryStore';
import { createRecoveryImperativeTools, selectStateAwareImperativeTools } from './toolDefinitions';

type AnyToolResult = {
  ok: boolean;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
};

function getToolByName(name: string) {
  const commands = createRecoveryCommands();
  const tools = createRecoveryImperativeTools(commands);
  const tool = tools.find((candidate) => candidate.name === name);

  if (!tool) {
    throw new Error(`Expected tool not found: ${name}`);
  }

  return tool;
}

describe('recovery imperative tool definitions', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());
  });

  it('matches the core T2.2 tool contract names, descriptions, schemas, and annotations', () => {
    const commands = createRecoveryCommands();
    const tools = createRecoveryImperativeTools(commands);

    expect(tools.map((tool) => tool.name)).toEqual([
      'get_recovery_snapshot',
      'create_recovery_case',
      'add_case_record',
      'stage_recovery_plan',
      'stage_outreach_draft',
    ]);

    const snapshot = tools[0];
    expect(snapshot.description).toBe(
      'Returns the current local recovery case, its latest plan state, important records, household constraints, and allowed next actions. Use this before proposing changes or answering questions about the case.'
    );
    expect(snapshot.annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true,
    });
    expect(snapshot.inputSchema).toEqual({
      type: 'object',
      properties: {
        includeActivity: {
          type: 'boolean',
          default: false,
          description: 'Include up to the 10 most recent activity entries.',
        },
      },
      additionalProperties: false,
    });

    const createCase = tools[1];
    expect(createCase.description).toBe(
      'Creates a local recovery case from facts the person supplied. Use after the person describes a household disruption and explicitly states whether immediate safety is resolved. This organizes information only and does not contact anyone or apply for services.'
    );
    expect(createCase.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: true,
    });
    expect(createCase.inputSchema).toMatchObject({
      type: 'object',
      required: ['incidentType', 'summary', 'safetyStatus'],
      additionalProperties: false,
      properties: {
        incidentType: {
          type: 'string',
          enum: ['home_flood', 'home_fire', 'severe_weather', 'temporary_displacement', 'other'],
        },
        summary: {
          type: 'string',
          minLength: 10,
          maxLength: 600,
        },
        safetyStatus: {
          type: 'string',
          enum: ['confirmed_safe', 'needs_immediate_help', 'unknown'],
        },
      },
    });

    const addRecord = tools[2];
    expect(addRecord.description).toBe(
      'Adds one factual record to the active case, such as damage observed, a communication received, an expense, a housing detail, a document, an insurance detail, or a deadline. Use only information the person supplied or confirmed.'
    );
    expect(addRecord.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: true,
    });
    expect(addRecord.inputSchema).toMatchObject({
      type: 'object',
      required: ['category', 'title', 'note'],
      additionalProperties: false,
      properties: {
        category: {
          type: 'string',
          enum: ['damage', 'communication', 'expense', 'housing', 'document', 'insurance', 'deadline'],
        },
        title: {
          type: 'string',
          minLength: 3,
          maxLength: 100,
        },
        note: {
          type: 'string',
          minLength: 3,
          maxLength: 1000,
        },
      },
    });

    const stagePlan = tools[3];
    expect(stagePlan.description).toBe(
      'Stages a prioritized recovery plan for the person to review. Use after reading the current case. This creates a pending proposal only; it cannot approve the plan, perform tasks, contact third parties, or determine eligibility.'
    );
    expect(stagePlan.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: true,
    });
    expect(stagePlan.inputSchema).toMatchObject({
      type: 'object',
      required: ['goal', 'tasks'],
      additionalProperties: false,
      properties: {
        goal: {
          type: 'string',
          minLength: 5,
          maxLength: 160,
        },
        tasks: {
          type: 'array',
          minItems: 1,
          maxItems: 6,
        },
      },
    });

    const stageDraft = tools[4];
    expect(stageDraft.description).toBe(
      'Creates an unsent message draft based on facts already in the case. Use when the person asks for help preparing communication. This tool never sends a message or submits information to another party.'
    );
    expect(stageDraft.annotations).toEqual({
      readOnlyHint: false,
      untrustedContentHint: true,
    });
    expect(stageDraft.inputSchema).toMatchObject({
      type: 'object',
      required: ['audience', 'subject', 'body'],
      additionalProperties: false,
      properties: {
        audience: {
          type: 'string',
          enum: [
            'landlord',
            'property_manager',
            'insurer',
            'employer',
            'service_provider',
            'family_or_friend',
            'other',
          ],
        },
        subject: {
          type: 'string',
          minLength: 3,
          maxLength: 120,
        },
        body: {
          type: 'string',
          minLength: 10,
          maxLength: 2000,
        },
      },
    });
  });

  it('selects available tools correctly for no-case, unsafe, safe, and pending-plan states', () => {
    const commands = createRecoveryCommands();
    const tools = createRecoveryImperativeTools(commands);

    const namesForState = () =>
      selectStateAwareImperativeTools(getCurrentDomainState(), tools).map((tool) => tool.name);

    expect(namesForState()).toEqual(['get_recovery_snapshot', 'create_recovery_case']);

    commands.createCase(
      {
        incidentType: 'other',
        summary: 'Immediate danger may still be present and we need to pause planning.',
        safetyStatus: 'unknown',
      },
      {
        actor: 'agent',
        source: 'webmcp',
        toolName: 'create_recovery_case',
      }
    );

    expect(namesForState()).toEqual(['get_recovery_snapshot']);

    commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded our apartment and immediate danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      {
        actor: 'agent',
        source: 'webmcp',
        toolName: 'create_recovery_case',
      }
    );

    expect(namesForState()).toEqual([
      'get_recovery_snapshot',
      'add_case_record',
      'stage_recovery_plan',
      'stage_outreach_draft',
    ]);

    commands.stagePlan(
      {
        goal: 'Stabilize this week\'s priorities',
        tasks: [
          {
            title: 'Document flooded rooms',
            category: 'documentation',
            priority: 'now',
            rationale: 'Creates factual evidence for follow-up communications.',
          },
        ],
      },
      {
        actor: 'agent',
        source: 'webmcp',
        toolName: 'stage_recovery_plan',
      }
    );

    expect(namesForState()).toEqual([
      'get_recovery_snapshot',
      'add_case_record',
      'stage_recovery_plan',
      'stage_outreach_draft',
    ]);
  });

  it('reads current state at execution time and rejects stale add-record operations', async () => {
    const commands = createRecoveryCommands();

    const createCaseTool = getToolByName('create_recovery_case');
    const addRecordTool = getToolByName('add_case_record');

    const createResult = (await createCaseTool.execute({
      incidentType: 'home_flood',
      summary: 'A burst pipe flooded our apartment and immediate danger has passed.',
      safetyStatus: 'confirmed_safe',
    })) as AnyToolResult;

    expect(createResult.ok).toBe(true);

    const addResultBeforeReset = (await addRecordTool.execute({
      category: 'communication',
      title: 'Landlord requested photos',
      note: 'Landlord asked for updated damage photos by Friday.',
    })) as AnyToolResult;

    expect(addResultBeforeReset.ok).toBe(true);

    commands.resetLocalData({
      actor: 'user',
      source: 'ui',
    });

    const addResultAfterReset = (await addRecordTool.execute({
      category: 'communication',
      title: 'Follow-up message',
      note: 'Attempted stale add after case reset.',
    })) as AnyToolResult;

    expect(addResultAfterReset.ok).toBe(false);
    expect(addResultAfterReset.code).toBe('state_conflict');
    expect(addResultAfterReset.message).toMatch(/start or load a case/i);
  });

  it('returns correctable field validation errors without internal implementation details', async () => {
    const createCaseTool = getToolByName('create_recovery_case');

    const result = (await createCaseTool.execute({
      incidentType: 'home_flood',
      summary: 'too short',
      safetyStatus: 'confirmed_safe',
    })) as AnyToolResult;

    expect(result.ok).toBe(false);
    expect(result.code).toBe('validation_error');
    expect(result.fieldErrors?.summary).toBeDefined();
    expect(result.message).toMatch(/some fields need correction/i);
    expect(result.message.toLowerCase()).not.toContain('zoderror');
    expect(result.message.toLowerCase()).not.toContain('stack');
  });

  it('validates stage_outreach_draft related record ids against current case records', async () => {
    const createCaseTool = getToolByName('create_recovery_case');
    const stageDraftTool = getToolByName('stage_outreach_draft');

    const createResult = (await createCaseTool.execute({
      incidentType: 'home_flood',
      summary: 'A burst pipe flooded our apartment and immediate danger has passed.',
      safetyStatus: 'confirmed_safe',
    })) as AnyToolResult;

    expect(createResult.ok).toBe(true);

    const draftResult = (await stageDraftTool.execute({
      audience: 'insurer',
      subject: 'Flood documentation update',
      body: 'I documented current damage and can share a factual update.',
      relatedRecordIds: ['missing-record-id'],
    })) as AnyToolResult;

    expect(draftResult.ok).toBe(false);
    expect(draftResult.code).toBe('validation_error');
    expect(draftResult.fieldErrors?.relatedRecordIds).toContain('Unknown record ID');
  });

  it('rejects stage_outreach_draft attachment claims that are not grounded in linked records', async () => {
    const createCaseTool = getToolByName('create_recovery_case');
    const stageDraftTool = getToolByName('stage_outreach_draft');

    const createResult = (await createCaseTool.execute({
      incidentType: 'home_flood',
      summary: 'A burst pipe flooded our apartment and immediate danger has passed.',
      safetyStatus: 'confirmed_safe',
    })) as AnyToolResult;

    expect(createResult.ok).toBe(true);

    const draftResult = (await stageDraftTool.execute({
      audience: 'insurer',
      subject: 'Flood update',
      body: 'I attached photos of the damage for your review.',
    })) as AnyToolResult;

    expect(draftResult.ok).toBe(false);
    expect(draftResult.code).toBe('validation_error');
    expect(draftResult.fieldErrors?.body).toContain('Attachment claims require supporting record evidence.');
  });
});
