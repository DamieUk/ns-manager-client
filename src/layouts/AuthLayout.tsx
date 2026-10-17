import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Logo } from '../components/Logo';
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
        <Stack spacing={1.5} sx={{ textAlign: 'center', alignItems: 'center', px: 6 }}>
          <Box sx={{ color: '#FFFFFF', mb: 1 }}>
            <Logo size={88} />
          </Box>
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
          p: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 380,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
          }}
        >
          {/* On phones the brand panel is hidden: show the mark above the form instead. */}
          <Stack direction="row" spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 3, color: FOREST }}>
            <Logo size={32} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Numenor
            </Typography>
          </Stack>
          {children}
        </Paper>
      </Box>
    </Box>
  );
}

export default AuthLayout;
