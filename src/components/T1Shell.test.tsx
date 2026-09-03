import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createEmptyDomainState } from '../domain/types';
import { replaceDomainState } from '../state/recoveryStore';
import { WebMCPStatus } from './WebMCPStatus';

describe('T1.2 shell behavior', () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());
  });

  it('starts a blank case and shows summary context', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start a blank case' }));

    expect(await screen.findByRole('heading', { name: 'What we know' })).toBeInTheDocument();
    expect(
      screen.getByText(/household disruption occurred and recovery details will be added next/i)
    ).toBeInTheDocument();
  });

  it('loads flood demo with seeded facts', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Load flood demo' }));

    expect(await screen.findByRole('heading', { name: 'What we know' })).toBeInTheDocument();
    expect(
      screen.getByText(
        /A burst pipe flooded the apartment. The household is safe and temporarily staying with a friend./i
      )
    ).toBeInTheDocument();
  });

  it('renders all WebMCP capability states', () => {
    render(
      <>
        <WebMCPStatus status="supported" />
        <WebMCPStatus status="registering" />
        <WebMCPStatus status="unsupported" />
        <WebMCPStatus status="error" errorMessage="simulated" />
      </>
    );

    expect(screen.getByText('Agent tools: supported')).toBeInTheDocument();
    expect(screen.getByText('Agent tools: registering')).toBeInTheDocument();
    expect(screen.getByText('Agent tools: unavailable')).toBeInTheDocument();
    expect(screen.getByText('Agent tools: error')).toBeInTheDocument();
    expect(
      screen.getByText(/Agent tools unavailable in this browser. The planner still works manually./i)
    ).toBeInTheDocument();
  });
});
