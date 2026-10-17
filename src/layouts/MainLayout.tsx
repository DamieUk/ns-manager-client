import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import { Avatar, Box, Container, IconButton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Logo } from '../components/Logo';
import type { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { FOREST, MINT_TINT } from '../theme';

const SIDEBAR_WIDTH = 260;

// `match` lists further path prefixes the item stays highlighted on; `badge` is a count to act on.
function NavItem({ to, icon, match = [], badge, children }: { to: string; icon: ReactNode; match?: string[]; badge?: number; children: ReactNode }) {
  const { pathname } = useLocation();
  const isActive = [to, ...match].some((prefix) => pathname.startsWith(prefix));

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
      <Box component="span" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      {Boolean(badge) && (
        <Box
          component="span"
          sx={{ minWidth: 20, height: 20, px: 0.75, borderRadius: 10, bgcolor: 'warning.main', color: '#fff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center' }}
        >
          {badge}
        </Box>
      )}
    </Box>
  );
}

// Leave requests waiting for an owner's decision, refreshed on every page change.
function usePendingLeaves(enabled: boolean): number {
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    apiClient
      .get<unknown[]>('/leaves', { params: { status: 'pending' } })
      .then((res) => setCount(res.data.length))
      .catch(() => setCount(0));
  }, [enabled, pathname]);
  return count;
}

function MainLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const pendingLeaves = usePendingLeaves(user?.role === 'executive');

  if (!user) return null;

  const isManagement = user.role === 'executive';

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
            }}
          >
            <Logo size={22} />
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
              <NavItem to="/board" match={['/orders/']} icon={<ViewKanbanOutlinedIcon fontSize="small" />}>
                Партії
              </NavItem>
              <NavItem to="/clients" icon={<PeopleAltOutlinedIcon fontSize="small" />}>
                Клієнти
              </NavItem>
              <NavItem to="/invoices" icon={<ReceiptLongOutlinedIcon fontSize="small" />}>
                Рахунки
              </NavItem>
              <NavItem to="/purchases" icon={<ShoppingCartOutlinedIcon fontSize="small" />}>
                Закупівлі
              </NavItem>
              <NavItem to="/shipments" icon={<LocalShippingOutlinedIcon fontSize="small" />}>
                Відвантаження
              </NavItem>
              {hasPermission(user, 'USERS', 'view') && (
                <NavItem to="/users" icon={<GroupsOutlinedIcon fontSize="small" />}>
                  Користувачі
                </NavItem>
              )}
              <NavItem to="/leaves" badge={pendingLeaves} icon={<BeachAccessOutlinedIcon fontSize="small" />}>
                Відпустки
              </NavItem>
              <NavItem to="/company" icon={<BusinessOutlinedIcon fontSize="small" />}>
                Компанія
              </NavItem>
            </>
          )}
          {user.role === 'employee' && (
            <>
              <NavItem to="/progress" icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}>
                Мій прогрес
              </NavItem>
              <NavItem to="/my-orders" match={['/orders/']} icon={<Inventory2OutlinedIcon fontSize="small" />}>
                Мої замовлення
              </NavItem>
              <NavItem to="/leaves" icon={<BeachAccessOutlinedIcon fontSize="small" />}>
                Відпустки
              </NavItem>
            </>
          )}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: 'center',
            mx: 1.5,
            px: 1.5,
            py: 1.25,
            borderRadius: 2,
            bgcolor: pathname.startsWith('/profile') ? MINT_TINT : 'background.default',
          }}
        >
          <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box component={Link} to="/profile" title="Мій профіль" sx={{ minWidth: 0, flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
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
        <Container maxWidth={pathname.startsWith('/board') ? false : 'lg'} sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default MainLayout;
