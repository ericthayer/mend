import { createTheme } from '@mui/material/styles';

const INK = '#14181f';
const INK_SOFT = '#5b6472';
const HAIRLINE = 'rgba(20, 24, 31, 0.08)';

const LIGHT_PALETTE = {
  primary: {
    main: '#174a84',
    light: '#3d6ea8',
    dark: '#0f3560',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#b27a16',
  },
  warning: {
    main: '#8f6210',
    light: '#b27a16',
    dark: '#6b4a0c',
    contrastText: '#ffffff',
  },
  error: {
    main: '#a13d3f',
  },
  success: {
    main: '#1f7a4d',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f4f4f1',
    paper: '#ffffff',
  },
  text: {
    primary: INK,
    secondary: INK_SOFT,
  },
  divider: HAIRLINE,
};

const DARK_PALETTE = {
  primary: {
    main: '#79b3f0',
    light: '#a8cdf5',
    dark: '#4f8dcc',
    contrastText: '#10243b',
  },
  secondary: {
    main: '#e4b85d',
  },
  warning: {
    main: '#e0ad4a',
    light: '#f0c66d',
    dark: '#ac781f',
    contrastText: '#241a07',
  },
  error: {
    main: '#ef8d8f',
    contrastText: '#2b0d0e',
  },
  success: {
    main: '#70d3a0',
    contrastText: '#092a1a',
  },
  background: {
    default: '#111820',
    paper: '#1c252f',
  },
  text: {
    primary: '#eef3f8',
    secondary: '#b8c4d1',
  },
  divider: 'rgba(238, 243, 248, 0.14)',
};

const OUTLINED_ALERT_SEVERITIES = ['info', 'success', 'warning', 'error'] as const;

function createOutlinedAlertVariant(severity: (typeof OUTLINED_ALERT_SEVERITIES)[number]) {
  return {
    props: { variant: 'outlined' as const, severity },
    style: {
      borderColor: `var(--mui-palette-${severity}-main)`,
      color: 'var(--mui-palette-text-primary)',
      '& .MuiAlert-icon': {
        color: `var(--mui-palette-${severity}-main)`,
      },
    },
  };
}

export const mendTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: LIGHT_PALETTE,
    },
    dark: {
      palette: DARK_PALETTE,
    },
  },
  shape: {
    borderRadius: 16,
  },
  spacing: 8,
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '1.25rem',
      lineHeight: 1.2,
      fontWeight: 750,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.125rem',
      lineHeight: 1.3,
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1rem',
      lineHeight: 1.4,
      fontWeight: 650,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9375rem',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 10,
          paddingLeft: 18,
          paddingRight: 18,
        },
        outlined: {
          borderColor: 'var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          '&:hover': {
            borderColor: 'var(--mui-palette-text-secondary)',
            backgroundColor: 'var(--mui-palette-action-hover)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid var(--mui-palette-divider)',
          boxShadow: 'none',
          backgroundImage: 'none',
          backgroundColor: 'var(--mui-palette-background-paper)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          height: 32,
        },
        sizeSmall: {
          height: 28,
          fontSize: '0.875rem',
          '& .MuiChip-label': {
            paddingLeft: 10,
            paddingRight: 10,
          },
        },
        label: {
          paddingLeft: 12,
          paddingRight: 12,
        },
        outlined: {
          backgroundColor: 'var(--mui-palette-background-paper)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          alignItems: 'flex-start',
        },
        outlined: {
          backgroundColor: 'var(--mui-palette-background-paper)',
          color: 'var(--mui-palette-text-primary)',
          '& .MuiAlert-action .MuiIconButton-root': {
            color: 'var(--mui-palette-text-secondary)',
          },
        },
      },
      variants: OUTLINED_ALERT_SEVERITIES.map(createOutlinedAlertVariant),
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          padding: 8,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          colorScheme: 'light dark',
        },
        '*': {
          boxSizing: 'border-box',
        },
        'html, body': {
          caretColor: 'var(--mui-palette-primary-main)',
          scrollbarColor:
            'var(--mui-palette-text-secondary) var(--mui-palette-background-default)',
        },
        '::selection': {
          backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.24)',
          color: 'var(--mui-palette-text-primary)',
        },
        '::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'var(--mui-palette-text-secondary)',
          borderRadius: 999,
          border: '2px solid var(--mui-palette-background-default)',
        },
      },
    },
  },
});
