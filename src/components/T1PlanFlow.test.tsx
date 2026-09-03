import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createRecoveryCommands } from '../domain/commands';
import { createEmptyDomainState } from '../domain/types';
import { loadPersistedState } from '../state/persistence';
import { replaceDomainState } from '../state/recoveryStore';

function stageCanonicalPlan() {
  const commands = createRecoveryCommands();
  return commands.stagePlan(
    {
      goal: 'Stabilize housing and documentation quickly',
      tasks: [
        {
          title: 'Capture damage photos in each room',
          category: 'documentation',
          priority: 'next',
          rationale: 'Keeps a factual record for communication and follow-up.',
        },
        {
          title: 'Secure accessible temporary housing',
          category: 'housing',
          priority: 'now',
          rationale: 'Housing accessibility is the immediate household constraint.',
        },
        {
          title: 'Create a shared expense list',
          category: 'financial',
          priority: 'later',
          rationale: 'Tracks costs after urgent safety and housing decisions.',
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

describe('T1.3 plan review and next actions', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());
  });

  it('supports seed → staged plan → UI approval → reload persistence', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));
    expect(await screen.findByRole('heading', { name: 'What we know' })).toBeInTheDocument();

    await act(async () => {
      stageCanonicalPlan();
    });

    expect(await screen.findByRole('heading', { name: 'Needs your review' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Confirm decision' }));

    expect(await screen.findByRole('heading', { name: 'Next actions' })).toBeInTheDocument();

    const list = screen.getByTestId('next-actions-list');
    const items = within(list).getAllByRole('listitem');

    expect(items[0].textContent).toContain('Secure accessible temporary housing');
    expect(items[1].textContent).toContain('Capture damage photos in each room');
    expect(items[2].textContent).toContain('Create a shared expense list');

    const loaded = loadPersistedState();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }

    const approved = loaded.state.plans.find((plan) => plan.status === 'approved');
    expect(approved).toBeDefined();
    expect(approved?.goal).toBe('Stabilize housing and documentation quickly');
  });

  it('keeps approved plan active while a revision is pending review', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));

    await act(async () => {
      stageCanonicalPlan();
    });
    await user.click(await screen.findByRole('button', { name: 'Confirm decision' }));

    const commands = createRecoveryCommands();
    await act(async () => {
      commands.stagePlan(
        {
          goal: 'Revise sequence after new housing detail',
          tasks: [
            {
              title: 'Confirm friend stay deadline in writing',
              category: 'housing',
              priority: 'now',
              rationale: 'A written deadline anchors near-term task timing.',
            },
          ],
        },
        {
          actor: 'agent',
          source: 'webmcp',
          toolName: 'stage_recovery_plan',
        }
      );
    });

    expect(await screen.findByRole('heading', { name: 'Needs your review' })).toBeInTheDocument();
    expect(screen.getByText(/Approved plan v1 stays active until you confirm this revision/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure accessible temporary housing/i)).toBeInTheDocument();
  });
});
