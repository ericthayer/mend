import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';
import { createEmptyDomainState } from './domain/types';
import { replaceDomainState } from './state/recoveryStore';

describe('App', () => {
  it('renders the app shell safety boundary', () => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());

    render(<App />);
    expect(screen.getByRole('heading', { name: 'Mend' })).toBeInTheDocument();
    expect(
      screen.getByText(/This tool helps organize recovery tasks after immediate danger has passed/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start a blank case' })).toBeInTheDocument();
  });

  it('places supporting case surfaces in the masonry workspace after a case begins', async () => {
    window.localStorage.clear();
    replaceDomainState(createEmptyDomainState());

    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Start a blank case' }));

    expect(await screen.findByTestId('supporting-workspace-masonry')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Next actions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Case records' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Drafts' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Activity' })).toBeInTheDocument();
  });
});
