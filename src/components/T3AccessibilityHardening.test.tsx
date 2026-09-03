import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createRecoveryCommands } from '../domain/commands';
import { createEmptyDomainState } from '../domain/types';
import { getCurrentDomainState, replaceDomainState, useRecoveryStore } from '../state/recoveryStore';

async function expectNoSeriousOrCriticalViolations(container: HTMLElement) {
  const results = await axe(container);
  const blockingViolations = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical'
  );

  expect(blockingViolations).toHaveLength(0);
}

async function tabToElement(
  user: ReturnType<typeof userEvent.setup>,
  element: HTMLElement,
  maxTabs = 80
) {
  for (let index = 0; index < maxTabs; index += 1) {
    await user.tab();
    if (document.activeElement === element) {
      return;
    }
  }

  throw new Error(`Could not focus element via keyboard tabbing: ${element.tagName}`);
}

function stagePendingPlan() {
  const commands = createRecoveryCommands();

  return commands.stagePlan(
    {
      goal: 'Stabilize immediate recovery tasks',
      tasks: [
        {
          title: 'Capture room-by-room flood inventory',
          category: 'documentation',
          priority: 'now',
          rationale: 'A detailed inventory keeps actions grounded in confirmed facts.',
        },
      ],
    },
    {
      actor: 'agent',
      source: 'webmcp',
      toolName: 'stage_recovery_plan',
    }
  );
}

describe('T3.2 accessibility and failure-state hardening', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());
    useRecoveryStore.setState({ storageAvailable: true, storageWarning: null });
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });

  it('has no serious or critical axe violations on empty state', async () => {
    const { container } = render(<App />);
    await expectNoSeriousOrCriticalViolations(container);
  });

  it('has no serious or critical axe violations on active dashboard state', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));
    expect(await screen.findByRole('heading', { name: 'What we know' })).toBeInTheDocument();

    await expectNoSeriousOrCriticalViolations(container);
  });

  it('has no serious or critical axe violations on pending-review state', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));

    await act(async () => {
      stagePendingPlan();
    });

    expect(await screen.findByRole('heading', { name: 'Needs your review' })).toBeInTheDocument();

    await expectNoSeriousOrCriticalViolations(container);
  });

  it('completes the primary review journey with keyboard interaction only', async () => {
    const user = userEvent.setup();
    render(<App />);

    const loadDemoButton = screen.getByRole('button', { name: 'Load flood demo' });
    await tabToElement(user, loadDemoButton);
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: 'What we know' })).toBeInTheDocument();

    await act(async () => {
      stagePendingPlan();
    });

    const decisionSelect = await screen.findByRole('combobox', { name: 'Decision' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm decision' });

    await tabToElement(user, decisionSelect);
    await tabToElement(user, confirmButton);
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: 'Next actions' })).toBeInTheDocument();
    expect(getCurrentDomainState().plans.some((plan) => plan.status === 'approved')).toBe(true);
  });

  it('keeps unsupported WebMCP and storage-warning states understandable and non-fatal', async () => {
    const user = userEvent.setup();
    useRecoveryStore.setState({
      storageAvailable: false,
      storageWarning: 'Local storage is unavailable. This case will not persist after you close the tab.',
    });

    render(<App />);

    expect(
      screen.getByText(/Agent tools unavailable in this browser. The planner still works manually./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Local storage is unavailable. This case will not persist after you close the tab./i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Start a blank case' }));
    expect(await screen.findByRole('heading', { name: 'What we know' })).toBeInTheDocument();
  });
});
