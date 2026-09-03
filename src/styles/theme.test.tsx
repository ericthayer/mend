import { CssBaseline } from '@mui/material';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { mendTheme } from './theme';

type MatchMediaController = {
  matchMedia: (query: string) => MediaQueryList;
  setMatches: (matches: boolean) => void;
};

function createMatchMediaController(initialMatches: boolean): MatchMediaController {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  return {
    matchMedia: (query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: (listener: MediaQueryList['onchange']) => {
        if (listener) {
          listeners.add(listener as unknown as (event: MediaQueryListEvent) => void);
        }
      },
      removeListener: (listener: MediaQueryList['onchange']) => {
        if (listener) {
          listeners.delete(listener as unknown as (event: MediaQueryListEvent) => void);
        }
      },
      addEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject | null
      ) => {
        if (typeof listener === 'function') {
          listeners.add(listener as (event: MediaQueryListEvent) => void);
        }
      },
      removeEventListener: (
        _type: string,
        listener: EventListenerOrEventListenerObject | null
      ) => {
        if (typeof listener === 'function') {
          listeners.delete(listener as (event: MediaQueryListEvent) => void);
        }
      },
      dispatchEvent: () => false,
    }),
    setMatches: (nextMatches) => {
      matches = nextMatches;
      const event = { matches, media: '(prefers-color-scheme: dark)' } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function ModeProbe() {
  const { mode, systemMode } = useColorScheme();

  return (
    <output data-testid="color-mode">
      {`${mode ?? 'undefined'}/${systemMode ?? 'undefined'}`}
    </output>
  );
}

function renderTheme(children: ReactNode) {
  return render(
    <ThemeProvider theme={mendTheme} defaultMode="system" noSsr storageManager={null}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

describe('Mend color schemes', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it('defines a readable custom palette for both system color modes', () => {
    expect(mendTheme).toHaveProperty('colorSchemeSelector', 'class');
    expect(mendTheme).toHaveProperty('colorSchemes.light.palette.background.default', '#f4f4f1');
    expect(mendTheme).toHaveProperty('colorSchemes.dark.palette.background.default', '#111820');
    expect(mendTheme).toHaveProperty('colorSchemes.dark.palette.text.primary', '#eef3f8');
  });

  it('follows prefers-color-scheme and responds to changes', async () => {
    const controller = createMatchMediaController(true);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: controller.matchMedia,
    });

    renderTheme(<ModeProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('color-mode')).toHaveTextContent('system/dark');
    });

    act(() => {
      controller.setMatches(false);
    });

    await waitFor(() => {
      expect(screen.getByTestId('color-mode')).toHaveTextContent('system/light');
    });
  });
});
