import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import { Avatar, Box, Container, IconButton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { FOREST, MINT_TINT } from '../theme';

const SIDEBAR_WIDTH = 260;

function NavItem({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(to);

  return (
    <Box
      component={Link}
      to={to}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        textDecoration: 'none',
        color: isActive ? 'primary.main' : 'text.secondary',
        bgcolor: isActive ? MINT_TINT : 'transparent',
        borderLeft: isActive ? `3px solid ${FOREST}` : '3px solid transparent',
        fontWeight: isActive ? 700 : 600,
        fontSize: '0.9rem',
        '&:hover': { bgcolor: isActive ? MINT_TINT : 'action.hover' },
      }}
    >
      {icon}
      {children}
    </Box>
  );
}

function MainLayout() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const isManagement = user.role === 'executive' || user.role === 'manager';

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          py: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', px: 3, mb: 4 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            N
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Numenor
          </Typography>
        </Stack>

        <Typography variant="caption" sx={{ px: 3, mb: 1, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em' }}>
          МЕНЮ
        </Typography>

        <Stack spacing={0.5} sx={{ px: 1.5 }}>
          {isManagement && (
            <>
              <NavItem to="/dashboard" icon={<SpaceDashboardOutlinedIcon fontSize="small" />}>
                Дашборд
              </NavItem>
              <NavItem to="/clients" icon={<PeopleAltOutlinedIcon fontSize="small" />}>
                Клієнти
              </NavItem>
              {hasPermission(user, 'USERS', 'view') && (
                <NavItem to="/users" icon={<GroupsOutlinedIcon fontSize="small" />}>
                  Користувачі
                </NavItem>
              )}
            </>
          )}
          {user.role === 'employee' && (
            <>
              <NavItem to="/progress" icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}>
                Мій прогрес
              </NavItem>
              <NavItem to="/my-orders" icon={<Inventory2OutlinedIcon fontSize="small" />}>
                Мої замовлення
              </NavItem>
            </>
          )}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', mx: 1.5, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: 'background.default' }}
        >
          <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
          <IconButton size="small" onClick={logout} aria-label="Вийти">
            <LogoutOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default MainLayout;
