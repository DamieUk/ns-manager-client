import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface AuthSuccessPanelProps {
  title: string;
  message: string;
  buttonLabel: string;
  to: string;
}

function AuthSuccessPanel({ title, message, buttonLabel, to }: AuthSuccessPanelProps) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 109, 91, 0.18)',
          color: 'primary.main',
        }}
      >
        <CheckCircleOutlineIcon fontSize="large" />
      </Box>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
      <Button component={RouterLink} to={to} variant="contained" fullWidth sx={{ mt: 1 }}>
        {buttonLabel}
      </Button>
    </Stack>
  );
}

export default AuthSuccessPanel;
