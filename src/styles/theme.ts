import { createTheme } from '@mui/material/styles';

export const mendTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#174a84',
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
    background: {
      default: '#f6f4ef',
      paper: '#fffdf8',
    },
    text: {
      primary: '#1f2733',
      secondary: '#364153',
    },
  },
  shape: {
    borderRadius: 14,
  },
  spacing: 8,
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: 16,
    h1: {
      fontSize: '2rem',
      lineHeight: 1.2,
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.25rem',
      lineHeight: 1.3,
      fontWeight: 650,
      letterSpacing: '-0.01em',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid rgba(23, 74, 132, 0.12)',
          boxShadow: '0 8px 20px rgba(18, 31, 48, 0.06)',
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
        '::selection': {
          backgroundColor: 'rgba(23, 74, 132, 0.2)',
        },
      },
    },
  },
});
