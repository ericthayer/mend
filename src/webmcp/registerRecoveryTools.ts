import {
  detectModelContext,
  registerToolSet,
  type RecoveryToolDefinition,
  type WebMCPCapabilityStatus,
} from './modelContextAdapter';

type RegisterRecoveryToolsInput = {
  tools: RecoveryToolDefinition[];
  documentRef?: Document;
  onStatusChange?: (status: WebMCPCapabilityStatus, errorMessage?: string) => void;
};

type ActiveRegistration = {
  controller: AbortController;
  cleanup: () => void;
};

let activeRegistration: ActiveRegistration | null = null;

function logRegisteredToolNames(tools: RecoveryToolDefinition[]): void {
  if (!import.meta.env.DEV) {
    return;
  }

  const names = tools.map((tool) => tool.name);
  const label = names.length > 0 ? names.join(', ') : '(none)';
  console.info(`[webmcp] registering tools: ${label}`);
}

export function cleanupRecoveryToolRegistration(): void {
  if (!activeRegistration) {
    return;
  }

  activeRegistration.controller.abort();
  activeRegistration.cleanup();
  activeRegistration = null;
}

export function registerRecoveryTools(
  input: RegisterRecoveryToolsInput
): {
  status: WebMCPCapabilityStatus;
  cleanup: () => void;
  errorMessage?: string;
} {
  cleanupRecoveryToolRegistration();

  const capability = detectModelContext(input.documentRef);

  if (capability.status === 'unsupported') {
    input.onStatusChange?.('unsupported', capability.errorMessage);

    return {
      status: 'unsupported',
      cleanup: () => {
        // no-op for unsupported environments
      },
      errorMessage: capability.errorMessage,
    };
  }

  if (capability.status === 'error') {
    input.onStatusChange?.('error', capability.errorMessage);

    return {
      status: 'error',
      cleanup: () => {
        // no-op when registration failed before setup
      },
      errorMessage: capability.errorMessage,
    };
  }

  input.onStatusChange?.('registering');

  const controller = new AbortController();

  try {
    logRegisteredToolNames(input.tools);

    const cleanup = registerToolSet({
      modelContext: capability.modelContext,
      tools: input.tools,
      signal: controller.signal,
    });

    activeRegistration = {
      controller,
      cleanup,
    };

    input.onStatusChange?.('supported');

    return {
      status: 'supported',
      cleanup: () => {
        if (activeRegistration?.controller === controller) {
          cleanupRecoveryToolRegistration();
        }
      },
    };
  } catch (error) {
    controller.abort();
    const errorMessage = error instanceof Error ? error.message : 'Failed to register tools.';

    input.onStatusChange?.('error', errorMessage);

    return {
      status: 'error',
      cleanup: () => {
        // no-op when registration failed
      },
      errorMessage,
    };
  }
}
