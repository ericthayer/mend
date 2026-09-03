import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { createRecoveryCommands } from '../domain/commands';
import { createEmptyDomainState } from '../domain/types';
import { getCurrentDomainState, replaceDomainState } from '../state/recoveryStore';

const TOOL_NAME = 'start_plan_review';
const TOOL_DESCRIPTION =
  'Prefills and focuses the review decision for the current pending recovery plan. The person must manually submit the visible form; this does not approve the plan or perform any recovery task.';

function stagePendingPlan() {
  const commands = createRecoveryCommands();

  return commands.stagePlan(
    {
      goal: 'Stabilize housing and records quickly',
      tasks: [
        {
          title: 'Capture damage inventory',
          category: 'documentation',
          priority: 'now',
          rationale: 'A detailed inventory keeps next steps grounded in facts.',
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

function getReviewForm(): HTMLFormElement {
  const form = document.querySelector(`form[toolname="${TOOL_NAME}"]`);
  if (!form) {
    throw new Error('Expected review form to be present');
  }

  return form as HTMLFormElement;
}

describe('T2.3 declarative review form', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });

  it('renders exact tool attributes only while a plan is pending and never uses toolautosubmit', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(document.querySelector(`form[toolname="${TOOL_NAME}"]`)).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));
    expect(await screen.findByRole('heading', { name: 'What we know' })).toBeInTheDocument();

    await act(async () => {
      stagePendingPlan();
    });

    expect(await screen.findByRole('heading', { name: 'Needs your review' })).toBeInTheDocument();

    const form = getReviewForm();
    expect(form.getAttribute('tooldescription')).toBe(TOOL_DESCRIPTION);
    expect(form.hasAttribute('toolautosubmit')).toBe(false);

    const decisionSelect = screen.getByRole('combobox', { name: 'Decision' });
    const noteTextarea = screen.getByRole('textbox', { name: 'Review note (optional)' });

    expect(decisionSelect).toHaveAttribute(
      'toolparamdescription',
      'The proposed review decision. The person can change it before submitting.'
    );
    expect(noteTextarea).toHaveAttribute(
      'toolparamdescription',
      'Optional review note for the plan history.'
    );
  });

  it('prefills and focuses on toolactivated without changing plan status', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));
    await act(async () => {
      stagePendingPlan();
    });

    const form = getReviewForm();
    const decisionSelect = screen.getByRole('combobox', { name: 'Decision' }) as HTMLSelectElement;
    const noteTextarea = screen.getByRole('textbox', {
      name: 'Review note (optional)',
    }) as HTMLTextAreaElement;

    fireEvent(
      form,
      new CustomEvent('toolactivated', {
        bubbles: true,
        detail: {
          toolName: TOOL_NAME,
          params: {
            decision: 'request_changes',
            note: 'Please add one housing-specific task.',
          },
        },
      })
    );

    expect(decisionSelect.value).toBe('request_changes');
    expect(noteTextarea.value).toBe('Please add one housing-specific task.');
    expect(
      screen.getByText(/Please confirm the decision manually before anything changes/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(decisionSelect).toHaveFocus();
    });

    const pendingPlan = getCurrentDomainState().plans.find((plan) => plan.status === 'pending_review');
    expect(pendingPlan).toBeDefined();
  });

  it('restores previous values on toolcancel', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));
    await act(async () => {
      stagePendingPlan();
    });

    const form = getReviewForm();
    const decisionSelect = screen.getByRole('combobox', { name: 'Decision' }) as HTMLSelectElement;
    const noteTextarea = screen.getByRole('textbox', {
      name: 'Review note (optional)',
    }) as HTMLTextAreaElement;

    await user.type(noteTextarea, 'Keep this note');

    fireEvent(
      form,
      new CustomEvent('toolactivated', {
        bubbles: true,
        detail: {
          toolName: TOOL_NAME,
          params: {
            decision: 'request_changes',
            note: 'Temporary prefill',
          },
        },
      })
    );

    expect(decisionSelect.value).toBe('request_changes');
    expect(noteTextarea.value).toBe('Temporary prefill');

    fireEvent(
      form,
      new CustomEvent('toolcancel', {
        bubbles: true,
        detail: {
          toolName: TOOL_NAME,
        },
      })
    );

    expect(decisionSelect.value).toBe('approve');
    expect(noteTextarea.value).toBe('Keep this note');
    expect(screen.getByText(/Previous values restored/i)).toBeInTheDocument();
  });

  it('submits manually through reviewPlan with actor user and responds when agent-invoked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));
    await act(async () => {
      stagePendingPlan();
    });

    const form = getReviewForm();
    const respondWith = vi.fn();

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    }) as Event & {
      agentInvoked?: boolean;
      respondWith?: (response: unknown) => void;
    };

    submitEvent.agentInvoked = true;
    submitEvent.respondWith = respondWith;

    await act(async () => {
      form.dispatchEvent(submitEvent);
    });

    expect(respondWith).toHaveBeenCalledTimes(1);
    expect(respondWith).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        code: 'ok',
        data: expect.objectContaining({
          status: 'approved',
        }),
      })
    );

    const approvedPlan = getCurrentDomainState().plans.find((plan) => plan.status === 'approved');
    expect(approvedPlan).toBeDefined();

    const activity = getCurrentDomainState().activity;
    const latestActivity = activity[activity.length - 1];
    expect(latestActivity?.actor).toBe('user');
    expect(latestActivity?.source).toBe('ui');
  });
});
