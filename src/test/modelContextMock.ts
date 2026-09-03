import type { RecoveryToolDefinition } from '../webmcp/modelContextAdapter';

type RegisteredTool = RecoveryToolDefinition;

export function installModelContextMock(targetDocument: Document = document) {
  const registeredTools = new Map<string, RegisteredTool>();
  const originalModelContext = targetDocument.modelContext;

  const modelContext: ModelContext = {
    registerTool(tool) {
      registeredTools.set(tool.name, tool);

      return {
        unregister: () => {
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
