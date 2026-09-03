import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createRecoveryCommands } from '../domain/commands';
import { createEmptyDomainState } from '../domain/types';
import { getCurrentDomainState, replaceDomainState } from '../state/recoveryStore';
import { installModelContextMock } from '../test/modelContextMock';
import {
  createRecoveryImperativeTools,
  selectStateAwareImperativeTools,
} from './toolDefinitions';
import {
  cleanupRecoveryToolRegistration,
  registerRecoveryTools,
} from './registerRecoveryTools';

describe('registerRecoveryTools', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());
    cleanupRecoveryToolRegistration();
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });

  it('returns unsupported when model context is not present', () => {
    const result = registerRecoveryTools({
      tools: [],
      documentRef: document,
    });

    expect(result.status).toBe('unsupported');
    result.cleanup();
  });

  it('registers state-aware tools with a mock model context and executes snapshot', async () => {
    const commands = createRecoveryCommands();
    const allTools = createRecoveryImperativeTools(commands);
    const mock = installModelContextMock(document);

    const result = registerRecoveryTools({
      tools: selectStateAwareImperativeTools(getCurrentDomainState(), allTools),
      documentRef: document,
    });

    expect(result.status).toBe('supported');
    expect(mock.listRegisteredToolNames()).toEqual([
      'get_recovery_snapshot',
      'create_recovery_case',
    ]);

    const snapshot = (await mock.executeTool('get_recovery_snapshot', {
      includeActivity: true,
    })) as {
      ok: boolean;
      data?: {
        case: unknown;
        allowedActions: string[];
      };
    };

    expect(snapshot.ok).toBe(true);
    if (snapshot.ok) {
      expect(snapshot.data?.case ?? null).toBeNull();
      expect(snapshot.data?.allowedActions).toEqual([
        'get_recovery_snapshot',
        'create_recovery_case',
      ]);
    }

    result.cleanup();
    mock.uninstall();
  });

  it('changes registered tools for no-case, unsafe, safe, and pending-plan states', () => {
    const commands = createRecoveryCommands();
    const allTools = createRecoveryImperativeTools(commands);
    const mock = installModelContextMock(document);

    const registerForCurrentState = () =>
      registerRecoveryTools({
        tools: selectStateAwareImperativeTools(getCurrentDomainState(), allTools),
        documentRef: document,
      });

    let registration = registerForCurrentState();
    expect(registration.status).toBe('supported');
    expect(mock.listRegisteredToolNames()).toEqual([
      'get_recovery_snapshot',
      'create_recovery_case',
    ]);

    commands.createCase(
      {
        incidentType: 'other',
        summary: 'Immediate danger may still be present so planning must be paused.',
        safetyStatus: 'unknown',
      },
      {
        actor: 'agent',
        source: 'webmcp',
        toolName: 'create_recovery_case',
      }
    );

    registration = registerForCurrentState();
    expect(registration.status).toBe('supported');
    expect(mock.listRegisteredToolNames()).toEqual(['get_recovery_snapshot']);

    commands.createCase(
      {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and immediate danger has passed.',
        safetyStatus: 'confirmed_safe',
      },
      {
        actor: 'agent',
        source: 'webmcp',
        toolName: 'create_recovery_case',
      }
    );

    registration = registerForCurrentState();
    expect(registration.status).toBe('supported');
    expect(mock.listRegisteredToolNames()).toEqual([
      'get_recovery_snapshot',
      'add_case_record',
      'stage_recovery_plan',
    ]);

    commands.stagePlan(
      {
        goal: 'Stabilize immediate priorities',
        tasks: [
          {
            title: 'Capture room-by-room flood photos',
            category: 'documentation',
            priority: 'now',
            rationale: 'Creates factual evidence for follow-up communication.',
          },
        ],
      },
      {
        actor: 'agent',
        source: 'webmcp',
        toolName: 'stage_recovery_plan',
      }
    );

    registration = registerForCurrentState();
    expect(registration.status).toBe('supported');
    expect(mock.listRegisteredToolNames()).toEqual([
      'get_recovery_snapshot',
      'add_case_record',
      'stage_recovery_plan',
    ]);

    registration.cleanup();
    mock.uninstall();
  });

  it('aborts and unregisters the previous tool set on re-registration', async () => {
    const mock = installModelContextMock(document);
    let firstSignal: AbortSignal | undefined;

    const firstRegistration = registerRecoveryTools({
      tools: [
        {
          name: 'first_tool',
          description: 'First tool',
          inputSchema: { type: 'object' },
          execute: async (_input, options) => {
            firstSignal = options?.signal;
            return { ok: true };
          },
        },
      ],
      documentRef: document,
    });

    await mock.executeTool('first_tool', {});
    expect(firstSignal?.aborted).toBe(false);

    const secondRegistration = registerRecoveryTools({
      tools: [
        {
          name: 'second_tool',
          description: 'Second tool',
          inputSchema: { type: 'object' },
          execute: async () => ({ ok: true }),
        },
      ],
      documentRef: document,
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(mock.listRegisteredToolNames()).toEqual(['second_tool']);

    firstRegistration.cleanup();
    secondRegistration.cleanup();
    mock.uninstall();
  });

  it('updates visible UI after successful tool calls', async () => {
    const mock = installModelContextMock(document);
    render(<App />);

    await waitFor(() => {
      expect(mock.listRegisteredToolNames()).toEqual([
        'get_recovery_snapshot',
        'create_recovery_case',
      ]);
    });

    let createCaseResult: unknown;
    await act(async () => {
      createCaseResult = await mock.executeTool('create_recovery_case', {
        incidentType: 'home_flood',
        summary: 'A burst pipe flooded the apartment and immediate danger has passed.',
        safetyStatus: 'confirmed_safe',
        householdNeeds: ['mobility', 'temporary_housing'],
      });
    });

    expect((createCaseResult as { ok: boolean }).ok).toBe(true);
    expect(await screen.findByRole('heading', { name: 'What we know' })).toBeInTheDocument();

    await waitFor(() => {
      expect(mock.listRegisteredToolNames()).toEqual([
        'get_recovery_snapshot',
        'add_case_record',
        'stage_recovery_plan',
      ]);
    });

    let addRecordResult: unknown;
    await act(async () => {
      addRecordResult = await mock.executeTool('add_case_record', {
        category: 'communication',
        title: 'Landlord requested photos',
        note: 'The landlord requested updated room photos by Friday.',
      });
    });

    expect((addRecordResult as { ok: boolean }).ok).toBe(true);
    const recordHeadings = await screen.findAllByRole('heading', {
      level: 3,
      name: 'Landlord requested photos',
    });
    expect(recordHeadings.length).toBeGreaterThan(0);

    let stagePlanResult: unknown;
    await act(async () => {
      stagePlanResult = await mock.executeTool('stage_recovery_plan', {
        goal: 'Stabilize immediate housing and documentation tasks',
        tasks: [
          {
            title: 'Capture complete flood damage inventory',
            category: 'documentation',
            priority: 'now',
            rationale: 'Evidence keeps communication and next steps grounded in facts.',
          },
        ],
      });
    });

    expect((stagePlanResult as { ok: boolean }).ok).toBe(true);
    expect(await screen.findByRole('heading', { name: 'Needs your review' })).toBeInTheDocument();

    cleanupRecoveryToolRegistration();
    mock.uninstall();
  });
});