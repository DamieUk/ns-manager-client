import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { roleHome } from './roleHome';

export function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={roleHome(user!.role)} replace />;
}
