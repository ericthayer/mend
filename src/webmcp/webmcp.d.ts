// src/webmcp/webmcp.d.ts

declare global {
  interface ModelContextToolRegistration {
    unregister: () => void;
  }

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
    registerTool: (
      tool: ModelContextTool,
      options?: {
        signal?: AbortSignal;
        exposedTo?: string[];
      }
    ) => ModelContextToolRegistration | Promise<ModelContextToolRegistration>;
    getTools?: (options?: { fromOrigins?: string[] }) => Promise<ModelContextTool[]>;
    executeTool?: (
      tool: ModelContextTool,
      inputJson: string,
      options?: { signal?: AbortSignal }
    ) => Promise<unknown>;
    listTools?: () => Promise<ModelContextTool[]>;
  }

  interface Document {
    modelContext?: ModelContext;
  }

  interface DocumentEventMap {
    toolactivated: CustomEvent<{ toolName: string; params?: Record<string, unknown> }>;
    toolcancel: CustomEvent<{ toolName: string }>;
  }
}

export {};