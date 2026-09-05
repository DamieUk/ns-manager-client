import { createTheme } from '@mui/material/styles';

const FOREST = '#16433A';
const FOREST_DARK = '#0E2E27';
const FOREST_LIGHT = '#1F5C4E';
const MINT = '#34C289';
const MINT_TINT = '#E4F7ED';
const PAGE_BG = '#F5F6F8';
const SURFACE = '#FFFFFF';
const INK = '#14171F';
const INK_SOFT = '#6B7280';
const LINE = '#ECEEF1';
const CORAL = '#E0525C';

const CARD_SHADOW = '0 1px 2px rgba(16,24,40,0.04), 0 6px 16px rgba(16,24,40,0.06)';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: FOREST, light: FOREST_LIGHT, dark: FOREST_DARK, contrastText: '#FFFFFF' },
    secondary: { main: MINT, light: MINT_TINT, dark: '#1F8F62', contrastText: FOREST_DARK },
    error: { main: CORAL },
    success: { main: MINT, light: MINT_TINT, dark: '#1F8F62' },
    background: { default: PAGE_BG, paper: SURFACE },
    text: { primary: INK, secondary: INK_SOFT },
    divider: LINE,
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${LINE}`,
          boxShadow: CARD_SHADOW,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: SURFACE,
          color: INK,
          borderBottom: `1px solid ${LINE}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', borderRadius: 10 },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        outlined: {
          borderColor: LINE,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: SURFACE,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: INK_SOFT,
          borderBottom: `1px solid ${LINE}`,
        },
        body: {
          borderBottom: `1px solid ${LINE}`,
        },
      },
    },
  },
});

export { FOREST, FOREST_DARK, FOREST_LIGHT, MINT, MINT_TINT, PAGE_BG, SURFACE, INK, INK_SOFT, LINE, CORAL, CARD_SHADOW };
export default theme;
