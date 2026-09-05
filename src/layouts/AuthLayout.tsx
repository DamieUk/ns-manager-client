import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { FOREST } from '../theme';

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: FOREST,
        }}
      >
        <Stack spacing={1.5} sx={{ textAlign: 'center', px: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
            Numenor
          </Typography>
          <Typography variant="body1" sx={{ color: '#DCEFE7', opacity: 0.9 }}>
            Керування виробництвом PCB — замовлення, клієнти та прогрес команди в одному місці.
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: { xs: 1, md: '0 0 440px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 380,
            p: 4,
            borderRadius: 3,
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  );
}

export default AuthLayout;
