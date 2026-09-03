import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { createRecoveryCommands } from '../domain/commands';
import { createEmptyDomainState, type OutreachDraft } from '../domain/types';
import { replaceDomainState } from '../state/recoveryStore';
import { DraftList } from './DraftList';

function setClipboardMock(writeTextImpl: (value: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: vi.fn(writeTextImpl),
    },
  });
}

function sampleDraft(): OutreachDraft {
  return {
    id: crypto.randomUUID(),
    caseId: crypto.randomUUID(),
    audience: 'landlord',
    subject: 'Flood update',
    body: 'We documented the flooded rooms and are preparing next steps.',
    relatedRecordIds: [],
    status: 'draft',
    createdBy: 'agent',
    createdAt: new Date().toISOString(),
  };
}

describe('T1.4 supporting views', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());
  });

  it('copies draft text successfully', async () => {
    const user = userEvent.setup();
    const draft = sampleDraft();
    setClipboardMock(async () => Promise.resolve());

    render(<DraftList drafts={[draft]} />);

    await user.click(screen.getByRole('button', { name: 'Copy draft text' }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${draft.subject}\n\n${draft.body}`
    );
    expect(screen.getByText('Draft copied to clipboard.')).toBeInTheDocument();
  });

  it('shows copy failure guidance when clipboard write fails', async () => {
    const user = userEvent.setup();
    const draft = sampleDraft();
    setClipboardMock(async () => {
      throw new Error('permission denied');
    });

    render(<DraftList drafts={[draft]} />);

    await user.click(screen.getByRole('button', { name: 'Copy draft text' }));

    expect(screen.getByText(/Could not copy draft/i)).toBeInTheDocument();
  });

  it('renders actor labels, resource links, and unsent draft state in app views', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));

    const commands = createRecoveryCommands();

    await act(async () => {
      commands.stagePlan(
        {
          goal: 'Organize immediate recovery actions',
          tasks: [
            {
              title: 'Document all damaged rooms',
              category: 'documentation',
              priority: 'now',
              rationale: 'Detailed records support landlord and aid conversations.',
              sourceIds: ['ready_critical_documents'],
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

    await user.click(await screen.findByRole('button', { name: 'Confirm decision' }));

    await act(async () => {
      commands.stageOutreachDraft(
        {
          audience: 'landlord',
          subject: 'Flood documentation summary',
          body: 'I documented the flooded rooms and can share details you requested.',
        },
        {
          actor: 'agent',
          source: 'webmcp',
          toolName: 'stage_outreach_draft',
        }
      );
    });

    expect(screen.getByText(/Type: communication · By: system/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Actor: agent/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Draft — not sent')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /send/i })).not.toBeInTheDocument();

    const resourceLink = screen.getByRole('link', {
      name: /Official resource: Ready.gov \(Verified Sep 2, 2026\)/i,
    });

    expect(resourceLink).toHaveAttribute(
      'href',
      'https://www.ready.gov/collection/safeguard-critical-documents-valuables'
    );
  });

  it('requires confirmation before reset and returns to empty state', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));
    expect(await screen.findByRole('heading', { name: 'What we know' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete Case' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/removes all local case records/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Delete local case' }));

    expect(await screen.findByRole('button', { name: 'Start a blank case' })).toBeInTheDocument();
  });
});
