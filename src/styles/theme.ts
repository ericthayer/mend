import { createTheme } from '@mui/material/styles';

const INK = '#14181f';
const INK_SOFT = '#5b6472';
const HAIRLINE = 'rgba(20, 24, 31, 0.08)';

export const mendTheme = createTheme({
  palette: {
    mode: 'light',
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
          borderColor: 'rgba(20, 24, 31, 0.16)',
          backgroundColor: '#ffffff',
          '&:hover': {
            borderColor: 'rgba(20, 24, 31, 0.32)',
            backgroundColor: '#fafaf8',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${HAIRLINE}`,
          boxShadow: 'none',
          backgroundImage: 'none',
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
          backgroundColor: '#ffffff',
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
          backgroundColor: '#ffffff',
        },
      },
      variants: [
        {
          props: { variant: 'outlined', severity: 'info' },
          style: {
            borderColor: 'rgba(20, 24, 31, 0.12)',
            color: '#14181f',
            '& .MuiAlert-icon': {
              color: '#5b6472',
            },
          },
        },
      ],
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
          colorScheme: 'light',
        },
        '*': {
          boxSizing: 'border-box',
        },
        'html, body': {
          caretColor: '#174a84',
          scrollbarColor: 'rgba(20, 24, 31, 0.28) transparent',
        },
        '::selection': {
          backgroundColor: 'rgba(23, 74, 132, 0.18)',
          color: INK,
        },
        '::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(20, 24, 31, 0.22)',
          borderRadius: 999,
          border: '2px solid #f4f4f1',
        },
      },
    },
  },
});
