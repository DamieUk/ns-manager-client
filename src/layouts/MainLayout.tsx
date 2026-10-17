import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/MenuOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import { AppBar, Avatar, Box, Container, Drawer, IconButton, Stack, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import { Logo } from '../components/Logo';
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
        py: { xs: 1.5, md: 1.25 },
        borderRadius: 2,
        textDecoration: 'none',
        color: isActive ? 'primary.main' : 'text.secondary',
        bgcolor: isActive ? MINT_TINT : 'transparent',
        borderLeft: isActive ? `3px solid ${FOREST}` : '3px solid transparent',
        fontWeight: isActive ? 700 : 600,
        fontSize: { xs: '0.95rem', md: '0.9rem' },
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

function Brand({ size = 36 }: { size?: number }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 2,
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <Logo size={Math.round(size * 0.6)} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        Numenor
      </Typography>
    </Stack>
  );
}

// Brand, navigation and the user card: the permanent sidebar on desktops, a drawer on phones.
function SidebarContent({ pendingLeaves }: { pendingLeaves: number }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  if (!user) return null;
  const isManagement = user.role === 'executive';

  return (
    <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', display: 'flex', flexDirection: 'column', py: 3 }}>
      <Box sx={{ px: 3, mb: 4 }}>
        <Brand />
      </Box>

      <Typography variant="caption" sx={{ px: 3, mb: 1, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em' }}>
        МЕНЮ
      </Typography>

      <Stack spacing={0.5} sx={{ px: 1.5, overflowY: 'auto' }}>
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
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {user.email}
          </Typography>
        </Box>
        <IconButton size="small" onClick={logout} aria-label="Вийти">
          <LogoutOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

// The app shell: a permanent sidebar on desktops; on phones and tablets a top bar whose menu
// button opens the same navigation as a drawer.
function MainLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerFor, setDrawerFor] = useState<string | null>(null);
  const pendingLeaves = usePendingLeaves(user?.role === 'executive');

  if (!user) return null;

  // The drawer belongs to the page it was opened on: navigating closes it.
  const drawerOpen = drawerFor === pathname;
  const isBoard = pathname.startsWith('/board');

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>
      {isDesktop ? (
        <Box component="nav" sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, bgcolor: 'background.paper', borderRight: '1px solid', borderColor: 'divider' }}>
          <SidebarContent pendingLeaves={pendingLeaves} />
        </Box>
      ) : (
        <>
          <AppBar position="static" elevation={0} sx={{ flexShrink: 0 }}>
            <Toolbar sx={{ minHeight: '56px !important', gap: 1, px: 1.5 }}>
              <IconButton edge="start" onClick={() => setDrawerFor(pathname)} aria-label="Меню" sx={{ position: 'relative' }}>
                <MenuIcon />
                {pendingLeaves > 0 && (
                  <Box sx={{ position: 'absolute', top: 8, right: 6, width: 9, height: 9, borderRadius: '50%', bgcolor: 'warning.main' }} />
                )}
              </IconButton>
              <Box component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none' }}>
                <Brand size={30} />
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton component={Link} to="/profile" aria-label="Мій профіль" sx={{ p: 0.5 }}>
                <Avatar src={user.avatarUrl ?? undefined} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 15 }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer open={drawerOpen} onClose={() => setDrawerFor(null)}>
            <SidebarContent pendingLeaves={pendingLeaves} />
          </Drawer>
        </>
      )}

      <Box component="main" sx={{ flexGrow: 1, minHeight: 0, minWidth: 0, overflow: 'auto' }}>
        <Container maxWidth={isBoard ? false : 'lg'} sx={{ py: { xs: 2.5, md: 4 }, px: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default MainLayout;
