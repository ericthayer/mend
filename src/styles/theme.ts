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

// Tonal (tinted-fill) chip badges read as an intentional product language rather
// than the hairline-outline default every MUI/Tailwind app ships with.
const CHIP_TONAL_COLORS = ['primary', 'success', 'warning', 'error'] as const;

function createTonalChipVariant(color: (typeof CHIP_TONAL_COLORS)[number]) {
  return {
    props: { variant: 'outlined' as const, color },
    style: {
      backgroundColor: `rgb(var(--mui-palette-${color}-mainChannel) / 0.12)`,
      borderColor: `rgb(var(--mui-palette-${color}-mainChannel) / 0.32)`,
      color: `var(--mui-palette-${color}-main)`,
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
    borderRadius: 20,
  },
  spacing: 8,
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '1.25rem',
      lineHeight: 1.2,
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontSize: '1.1875rem',
      lineHeight: 1.3,
      fontWeight: 750,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: '1rem',
      lineHeight: 1.4,
      fontWeight: 700,
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
          borderRadius: 999,
          paddingLeft: 24,
          paddingRight: 24,
          transition:
            'transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1), background-color 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          '&:active': {
            transform: 'scale(0.985)',
          },
        },
        contained: {
          boxShadow: '0 10px 24px rgb(var(--mui-palette-primary-darkChannel) / 0.2)',
          '@media (hover: hover)': {
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 14px 30px rgb(var(--mui-palette-primary-darkChannel) / 0.26)',
            },
          },
        },
        outlined: {
          borderColor: 'var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          '@media (hover: hover)': {
            '&:hover': {
              transform: 'translateY(-1px)',
              borderColor: 'var(--mui-palette-text-secondary)',
              backgroundColor: 'var(--mui-palette-action-hover)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid var(--mui-palette-divider)',
          boxShadow:
            '0 1px 1px rgb(20 24 31 / 0.02), 0 10px 24px -8px rgb(20 24 31 / 0.10), 0 28px 56px -24px rgb(20 24 31 / 0.08)',
          backgroundImage: 'none',
          backgroundColor: 'var(--mui-palette-background-paper)',
          'html.dark &': {
            boxShadow:
              'inset 0 1px 0 rgb(255 255 255 / 0.05), 0 20px 44px -24px rgb(0 0 0 / 0.55)',
          },
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
      variants: [
        ...CHIP_TONAL_COLORS.map(createTonalChipVariant),
        {
          props: { variant: 'outlined' as const, color: 'default' as const },
          style: {
            backgroundColor: 'var(--mui-palette-action-hover)',
            borderColor: 'var(--mui-palette-divider)',
            color: 'var(--mui-palette-text-secondary)',
          },
        },
      ],
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
          borderRadius: 24,
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
          backgroundColor: 'var(--mui-palette-background-default)',
          backgroundImage:
            'radial-gradient(ellipse 64% 42% at -12% 44%, transparent 58%, rgb(var(--mui-palette-primary-mainChannel) / 0.09) 58.35%, transparent 58.8%), radial-gradient(ellipse 54% 36% at 112% 20%, transparent 58%, rgb(var(--mui-palette-primary-mainChannel) / 0.08) 58.35%, transparent 58.8%), radial-gradient(circle at 1px 1px, rgb(var(--mui-palette-primary-mainChannel) / 0.11) 1px, transparent 1.25px), radial-gradient(circle at 86% -8%, rgb(var(--mui-palette-primary-mainChannel) / 0.13), transparent min(56vw, 42rem))',
          backgroundPosition: 'center, center, 18px 18px, center',
          backgroundRepeat: 'no-repeat, no-repeat, repeat, no-repeat',
          backgroundSize: 'auto, auto, 112px 112px, auto',
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
