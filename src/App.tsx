import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { ClientsPage } from './pages/ClientsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { LoginPage } from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProgressPage } from './pages/ProgressPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { UsersPage } from './pages/UsersPage';
import { ProtectedRoute } from './routing/ProtectedRoute';
import { RoleHomeRedirect } from './routing/RoleHomeRedirect';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute allow={['executive', 'manager', 'employee']} />}>
        <Route element={<MainLayout />}>
          <Route index element={<RoleHomeRedirect />} />

          <Route element={<ProtectedRoute allow={['executive', 'manager']} />}>
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute allow={['executive', 'manager']} permission={{ key: 'ORDERS', minAction: 'view' }} />}>
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:clientId" element={<ClientDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allow={['executive', 'manager']} permission={{ key: 'USERS', minAction: 'view' }} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route element={<ProtectedRoute allow={['employee']} />}>
            <Route path="progress" element={<ProgressPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
