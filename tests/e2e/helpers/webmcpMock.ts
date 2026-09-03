import { expect, type Page } from '@playwright/test';

export async function installWebMCPMock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const registeredTools = new Map();
    const targetWindow = window as unknown as {
      __mendWebMCP?: {
        listToolNames: () => string[];
        executeTool: (name: string, input: unknown) => Promise<unknown>;
      };
    };

    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool(tool: { name: string; execute: (input: unknown) => Promise<unknown> }) {
          registeredTools.set(tool.name, tool);

          return {
            unregister() {
              const current = registeredTools.get(tool.name);
              if (current === tool) {
                registeredTools.delete(tool.name);
              }
            },
          };
        },
        listTools: async () => Array.from(registeredTools.values()),
      },
    });

    targetWindow.__mendWebMCP = {
      listToolNames() {
        return Array.from(registeredTools.keys());
      },
      async executeTool(name, input) {
        const tool = registeredTools.get(name);
        if (!tool) {
          throw new Error(`Tool not registered: ${name}`);
        }

        return tool.execute(input);
      },
    };
  });
}

export async function listRegisteredToolNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const harness = (window as unknown as {
      __mendWebMCP?: {
        listToolNames: () => string[];
      };
    }).__mendWebMCP;

    return harness ? harness.listToolNames() : [];
  });
}

export async function executeRegisteredTool(
  page: Page,
  name: string,
  input: unknown
): Promise<unknown> {
  return page.evaluate(
    async ({ toolName, toolInput }) => {
      const harness = (window as unknown as {
        __mendWebMCP?: {
          executeTool: (name: string, input: unknown) => Promise<unknown>;
        };
      }).__mendWebMCP;

      if (!harness) {
        throw new Error('WebMCP test harness missing on window.');
      }

      return harness.executeTool(toolName, toolInput);
    },
    { toolName: name, toolInput: input }
  );
}

export async function waitForToolAvailability(page: Page, toolName: string): Promise<void> {
  await expect
    .poll(async () => {
      const names = await listRegisteredToolNames(page);
      return names.includes(toolName);
    })
    .toBe(true);
}

export async function loadDemoAndStagePendingPlan(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Load flood demo' }).click();
  await expect(page.getByRole('heading', { name: 'What we know' })).toBeVisible();

  await waitForToolAvailability(page, 'stage_recovery_plan');

  const result = (await executeRegisteredTool(page, 'stage_recovery_plan', {
    goal: 'Stabilize immediate housing and documentation priorities',
    tasks: [
      {
        title: 'Secure accessible temporary housing options',
        category: 'housing',
        priority: 'now',
        rationale: 'Housing accessibility is the top household constraint for this week.',
      },
      {
        title: 'Capture a room-by-room flood inventory',
        category: 'documentation',
        priority: 'next',
        rationale: 'Detailed records keep landlord and aid follow-up grounded in facts.',
      },
      {
        title: 'Track expenses related to temporary relocation',
        category: 'financial',
        priority: 'later',
        rationale: 'A running list supports reimbursement and planning decisions later.',
      },
    ],
  })) as { ok: boolean; code: string; message: string };

  expect(result.ok).toBe(true);
  expect(result.code).toBe('ok');
  await expect(page.getByRole('heading', { name: 'Needs your review' })).toBeVisible();
}
