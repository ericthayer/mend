import type { RecoveryToolDefinition } from '../webmcp/modelContextAdapter';

type RegisteredTool = RecoveryToolDefinition;

export function installModelContextMock(targetDocument: Document = document) {
  const registeredTools = new Map<string, RegisteredTool>();
  const originalModelContext = targetDocument.modelContext;

  const modelContext: ModelContext = {
    registerTool(tool, options) {
      if (options?.signal?.aborted) {
        return {
          unregister: () => {
            // no-op when registration was already aborted
          },
        };
      }

      registeredTools.set(tool.name, tool);

      const handleAbort = () => {
        const current = registeredTools.get(tool.name);
        if (current === tool) {
          registeredTools.delete(tool.name);
        }
      };

      options?.signal?.addEventListener('abort', handleAbort, { once: true });

      return {
        unregister: () => {
          options?.signal?.removeEventListener('abort', handleAbort);
          const current = registeredTools.get(tool.name);
          if (current === tool) {
            registeredTools.delete(tool.name);
          }
        },
      };
    },
    listTools: async () => Array.from(registeredTools.values()),
  };

  Object.defineProperty(targetDocument, 'modelContext', {
    configurable: true,
    writable: true,
    value: modelContext,
  });

  return {
    listRegisteredToolNames(): string[] {
      return Array.from(registeredTools.keys());
    },
    listRegisteredTools(): RegisteredTool[] {
      return Array.from(registeredTools.values());
    },
    async executeTool(name: string, input: unknown) {
      const tool = registeredTools.get(name);
      if (!tool) {
        throw new Error(`Tool not registered: ${name}`);
      }

      return tool.execute(input);
    },
    uninstall() {
      Object.defineProperty(targetDocument, 'modelContext', {
        configurable: true,
        writable: true,
        value: originalModelContext,
      });

      registeredTools.clear();
    },
  };
}
