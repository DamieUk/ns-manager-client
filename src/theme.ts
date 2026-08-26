import { createTheme } from '@mui/material/styles';

const EMERALD = '#006D5B';
const GOLD = '#B8860B';
const BIKING_RED = '#800020';
const BLUE_DEPTH = '#0D1B3D';
const OBSIDIAN = '#111111';
const PARCHMENT = '#F0E6C2';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: EMERALD, light: '#3d9483', dark: '#004d40', contrastText: '#fdfaf0' },
    secondary: { main: GOLD, light: '#d1a53f', dark: '#8a6608', contrastText: '#1f1a12' },
    error: { main: BIKING_RED },
    background: { default: PARCHMENT, paper: '#fbf6e3' },
    text: { primary: '#1f1a12', secondary: '#6b5f47' },
    divider: 'rgba(184, 134, 11, 0.3)',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Shantell Sans", "Nunito", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(184, 134, 11, 0.3)',
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: OBSIDIAN,
          color: '#f2ede3',
          borderBottom: `1px solid ${GOLD}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none' },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        outlined: {
          borderColor: 'rgba(184, 134, 11, 0.6)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#fffdf5',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#8a6608',
        },
      },
    },
  },
});

export { EMERALD, GOLD, BIKING_RED, BLUE_DEPTH, OBSIDIAN, PARCHMENT };
export default theme;
