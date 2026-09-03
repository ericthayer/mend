// src/webmcp/webmcp.d.ts

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (input: unknown, options?: { signal?: AbortSignal }) => Promise<unknown>;
}

interface ModelContext {
  registerTool: (tool: ModelContextTool) => { unregister: () => void };
  listTools?: () => Promise<ModelContextTool[]>;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }

  interface DocumentEventMap {
    toolactivated: CustomEvent<{ toolName: string; params?: Record<string, unknown> }>;
    toolcancel: CustomEvent<{ toolName: string }>;
  }
}

export {};