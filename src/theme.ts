import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1', light: '#818cf8', dark: '#4338ca' },
    secondary: { main: '#22d3ee' },
    background: { default: '#0b0f19', paper: '#131826' },
    text: { primary: '#e5e7eb', secondary: '#9ca3af' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(99, 102, 241, 0.15)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
            backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export default theme;
