import React, { Suspense, lazy, useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import AuthContext from '../context/AuthContext';
import LoadingModal from '../components/loadingModal/LoadingModal';
import Sidebar from '../components/sidebar/Sidebar';
import ProtectedRoute from './ProtectedRoute';
import HardwareBackButtonHandler from '../components/Navigation/HardwareBackButtonHandler';

const Login = lazy(() => import('../pages/login/Login'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const InventoriesPage = lazy(() => import('../pages/inventories/InventoriesPage'));
const CreateInventory = lazy(() => import('../pages/inventories/CreateInventory'));
const UpdateInventory = lazy(() => import('../pages/inventories/UpdateInventory'));
const ViewInventory = lazy(() => import('../pages/inventories/ViewInventory'));
const InventoryDecommissioning = lazy(
  () => import('../pages/inventories/InventoryDecommissioning'),
);
const Catalogs = lazy(() => import('../pages/inventories/catalogs/Catalogs'));
const Account = lazy(() => import('../pages/account/Account'));
const UsersPage = lazy(() => import('../pages/users/UsersPage'));
const NotFound = lazy(() => import('../pages/notFound/NotFound'));
const Roles = lazy(() => import('../pages/roles/Roles'));
const VerticalPage = lazy(() => import('../pages/vertical/VerticalPage'));
const PurchaseOrdersPage = lazy(
  () => import('../pages/purchaseOrders/PurchaseOrdersPage'),
);
const InvoicesPage = lazy(() => import('../pages/invoices/InvoicesPage'));
const CreateCustody = lazy(() => import('../pages/Custody/CreateCustody'));
const CustodyPage = lazy(() => import('../pages/Custody/CustodyPage'));
const PublicCustodyView = lazy(() => import('../pages/Custody/PublicCustodyView'));
const ViewCustody = lazy(() => import('../pages/Custody/ViewCustody'));
const Preferences = lazy(() => import('../pages/preferences/Preferences'));
const NotificationsPage = lazy(
  () => import('../pages/preferences/NotificationsPage'),
);
const NotificationRulesPage = lazy(
  () => import('../pages/preferences/NotificationRulesPage'),
);
const AgendaPage = lazy(() => import('../pages/agenda/AgendaPage'));
const AuditPage = lazy(() => import('../pages/audit/AuditPage'));

const AppRouter = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingModal loading={true} />;
  }

  return (
    <Router>
      <HardwareBackButtonHandler>
        <Suspense fallback={<LoadingModal loading={true} />}>
          {user ? <AuthorizedRoute user={user} /> : <UnauthorizedRoute />}
        </Suspense>
      </HardwareBackButtonHandler>
    </Router>
  );
};

const AuthorizedRoute = ({ user }) => {
  return (
    <Routes>
      <Route path="/custody/public/:token" element={<PublicCustodyView />} />
      <Route
        path="*"
        element={
          <Sidebar>
            <Routes>
              <Route element={<ProtectedRoute user={user} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/account-settings" element={<Account />} />
                <Route path="/preferences" element={<Preferences />} />
                <Route
                  path="/preferences/notifications"
                  element={<NotificationsPage />}
                />
                <Route
                  path="/preferences/notification-rules"
                  element={<NotificationRulesPage />}
                />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/inventories" element={<InventoriesPage />} />
                <Route path="/inventories/create" element={<CreateInventory />} />
                <Route
                  path="/inventories/decommissioning"
                  element={<InventoryDecommissioning />}
                />
                <Route path="/inventories/edit/:id" element={<UpdateInventory />} />
                <Route path="/inventories/view/:id" element={<ViewInventory />} />
                <Route path="/custody" element={<CustodyPage />} />
                <Route path="/custody/create" element={<CreateCustody />} />
                <Route path="/custody/edit/:id" element={<CreateCustody />} />
                <Route path="/custody/view/:id" element={<ViewCustody />} />
                <Route path="/verticals" element={<VerticalPage />} />
                <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/catalogs" element={<Catalogs />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/audit-logs" element={<AuditPage />} />
                <Route path="/login" element={<Navigate to={'/'} replace={true} />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Sidebar>
        }
      />
    </Routes>
  );
};

const UnauthorizedRoute = () => {
  return (
    <Routes>
      <Route path="/custody/public/:token" element={<PublicCustodyView />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRouter;
