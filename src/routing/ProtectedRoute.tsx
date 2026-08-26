import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';
import { hasPermission } from '../auth/permissions';
import { useAuth } from '../auth/useAuth';
import type { PermissionAction, PermissionKey, Role } from '../types/auth';
import { roleHome } from './roleHome';

interface ProtectedRouteProps {
  allow: Role[];
  permission?: { key: PermissionKey; minAction: PermissionAction };
}

export function ProtectedRoute({ allow, permission }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  if (permission && !hasPermission(user, permission.key, permission.minAction)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return <Outlet />;
}
