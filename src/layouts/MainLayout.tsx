import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Avatar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';

function NavButton({ to, children }: { to: string; children: ReactNode }) {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(to);

  return (
    <Button
      component={Link}
      to={to}
      sx={{
        color: isActive ? 'primary.main' : 'text.secondary',
        fontWeight: isActive ? 700 : 600,
        ml: 2,
      }}
    >
      {children}
    </Button>
  );
}

function MainLayout() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Numenor
          </Typography>

          {(user.role === 'executive' || user.role === 'manager') && (
            <>
              <NavButton to="/dashboard">Дашборд</NavButton>
              <NavButton to="/clients">Клієнти</NavButton>
              {hasPermission(user, 'USERS', 'view') && <NavButton to="/users">Користувачі</NavButton>}
            </>
          )}
          {user.role === 'employee' && <NavButton to="/progress">Мій прогрес</NavButton>}

          <Avatar
            src={user.avatarUrl ?? undefined}
            sx={{ width: 32, height: 32, ml: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <IconButton color="inherit" onClick={logout} sx={{ ml: 1 }} aria-label="Вийти">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default MainLayout;
