import { beforeEach, describe, expect, it } from 'vitest';
import { installModelContextMock } from '../test/modelContextMock';
import {
  cleanupRecoveryToolRegistration,
  registerRecoveryTools,
} from './registerRecoveryTools';

describe('registerRecoveryTools', () => {
  beforeEach(() => {
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

  it('registers tools with a mock model context and executes them', async () => {
    const mock = installModelContextMock(document);

    const result = registerRecoveryTools({
      tools: [
        {
          name: 'echo',
          description: 'Echo tool',
          inputSchema: { type: 'object' },
          annotations: {
            readOnlyHint: true,
            untrustedContentHint: true,
          },
          execute: async (input) => ({ echoed: input }),
        },
      ],
      documentRef: document,
    });

    expect(result.status).toBe('supported');
    expect(mock.listRegisteredToolNames()).toEqual(['echo']);

    const output = await mock.executeTool('echo', { a: 1 });
    expect(output).toEqual({ echoed: { a: 1 } });

    result.cleanup();
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
});
