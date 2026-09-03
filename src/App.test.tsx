import { render, screen } from '@testing-library/react';
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
});
