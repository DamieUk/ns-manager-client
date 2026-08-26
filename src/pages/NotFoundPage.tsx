import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function NotFoundPage() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          404
        </Typography>
        <Typography sx={{ mb: 3 }}>Сторінку не знайдено.</Typography>
        <Button component={RouterLink} to="/" variant="contained">
          На головну
        </Button>
      </Container>
    </Box>
  );
}

export default NotFoundPage;
