export type WebMCPCapabilityStatus = 'supported' | 'unsupported' | 'registering' | 'error';

export type RecoveryToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (input: unknown, options?: { signal?: AbortSignal }) => Promise<unknown>;
};

export type ModelContextCapability =
  | {
      status: 'supported';
      modelContext: ModelContext;
    }
  | {
      status: 'unsupported';
      modelContext: null;
      errorMessage?: string;
    }
  | {
      status: 'error';
      modelContext: null;
      errorMessage: string;
    };

export function detectModelContext(documentRef?: Document): ModelContextCapability {
  if (typeof document === 'undefined' && !documentRef) {
    return {
      status: 'unsupported',
      modelContext: null,
      errorMessage: 'No document context is available in this environment.',
    };
  }

  const targetDocument = documentRef ?? document;

  try {
    if (!targetDocument.modelContext) {
      return {
        status: 'unsupported',
        modelContext: null,
      };
    }

    return {
      status: 'supported',
      modelContext: targetDocument.modelContext,
    };
  } catch (error) {
    return {
      status: 'error',
      modelContext: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to detect model context.',
    };
  }
}

export function registerToolSet(params: {
  modelContext: ModelContext;
  tools: RecoveryToolDefinition[];
  signal: AbortSignal;
}): () => void {
  const seenToolNames = new Set<string>();
  for (const tool of params.tools) {
    if (seenToolNames.has(tool.name)) {
      throw new Error(`Duplicate tool name in registration set: ${tool.name}`);
    }

    seenToolNames.add(tool.name);
  }

  const unregisterCallbacks: Array<() => void> = [];
  let isCleanedUp = false;

  const maybeTrackUnregister = (registration: unknown) => {
    if (!registration || typeof registration !== 'object') {
      return;
    }

    const unregister = (registration as { unregister?: unknown }).unregister;
    if (typeof unregister !== 'function') {
      return;
    }

    if (isCleanedUp) {
      return;
    }

    unregisterCallbacks.push(unregister as () => void);
  };

  for (const tool of params.tools) {
    const registration = params.modelContext.registerTool(
      {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
        execute: async (input) => {
          if (params.signal.aborted) {
            throw new DOMException('Registration aborted', 'AbortError');
          }

          return tool.execute(input, { signal: params.signal });
        },
      },
      {
        signal: params.signal,
      }
    );

    if (registration && typeof (registration as Promise<unknown>).then === 'function') {
      (registration as Promise<unknown>)
        .then((resolvedRegistration) => {
          maybeTrackUnregister(resolvedRegistration);
        })
        .catch((error) => {
          console.error(
            '[webmcp] registerTool promise rejected:',
            error instanceof Error ? error.message : error
          );
        });
      continue;
    }

    maybeTrackUnregister(registration);
  }

  return () => {
    isCleanedUp = true;

    for (const unregister of unregisterCallbacks.reverse()) {
      unregister();
    }
  };
}
