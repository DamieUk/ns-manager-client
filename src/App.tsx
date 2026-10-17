import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { BoardPage } from './pages/BoardPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { ClientsPage } from './pages/ClientsPage';
import { CompanyPage } from './pages/CompanyPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { LeavesPage } from './pages/LeavesPage';
import { LoginPage } from './pages/LoginPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import NotFoundPage from './pages/NotFoundPage';
import { OrderPage } from './pages/OrderPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgressPage } from './pages/ProgressPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { UsersPage } from './pages/UsersPage';
import { ProtectedRoute } from './routing/ProtectedRoute';
import { RoleHomeRedirect } from './routing/RoleHomeRedirect';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute allow={['executive', 'employee']} />}>
        <Route element={<MainLayout />}>
          <Route index element={<RoleHomeRedirect />} />

          <Route element={<ProtectedRoute allow={['executive']} />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="board" element={<BoardPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="purchases" element={<PurchasesPage />} />
            <Route path="shipments" element={<ShipmentsPage />} />
            <Route path="company" element={<CompanyPage />} />
          </Route>

          <Route path="orders/:orderId" element={<OrderPage />} />
          <Route path="leaves" element={<LeavesPage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route element={<ProtectedRoute allow={['executive']} permission={{ key: 'ORDERS', minAction: 'view' }} />}>
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:clientId" element={<ClientDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allow={['executive']} permission={{ key: 'USERS', minAction: 'view' }} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route element={<ProtectedRoute allow={['employee']} />}>
            <Route path="progress" element={<ProgressPage />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
