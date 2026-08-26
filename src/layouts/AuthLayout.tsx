import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

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
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 480,
            height: 480,
            borderRadius: '50%',
            top: '-10%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            bottom: '-10%',
            right: '-5%',
            background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <Stack spacing={2} sx={{ position: 'relative', textAlign: 'center', px: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            Numenor
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Керування виробництвом PCB — замовлення, клієнти та прогрес команди в одному місці.
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          flex: { xs: 1, md: '0 0 480px' },
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
            maxWidth: 400,
            p: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(19, 24, 38, 0.7)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  );
}

export default AuthLayout;
