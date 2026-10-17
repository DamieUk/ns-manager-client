import { useMediaQuery, useTheme } from '@mui/material';

// Below the `sm` breakpoint (600px): lists become cards and dialogs take the whole screen.
export function useIsPhone(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}
