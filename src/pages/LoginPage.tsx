import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { getGoogleSignInUrl } from '../auth/googleAuth';
import { useAuth } from '../auth/useAuth';
import ApiStatus from '../components/ApiStatus';
import { roleHome } from '../routing/roleHome';

export function LoginPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Numenor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Увійдіть, щоб продовжити
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              window.location.href = getGoogleSignInUrl();
            }}
          >
            Увійти через Google
          </Button>
          <Box sx={{ mt: 3 }}>
            <ApiStatus />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
