import React, { useContext } from 'react';
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
import ChunkErrorBoundary from '../components/ChunkErrorBoundary';
import Login from '../pages/login/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import InventoriesPage from '../pages/inventories/InventoriesPage';
import CreateInventory from '../pages/inventories/CreateInventory';
import UpdateInventory from '../pages/inventories/UpdateInventory';
import ViewInventory from '../pages/inventories/ViewInventory';
import InventoryDecommissioning from '../pages/inventories/InventoryDecommissioning';
import Catalogs from '../pages/inventories/catalogs/Catalogs';
import Account from '../pages/account/Account';
import UsersPage from '../pages/users/UsersPage';
import NotFound from '../pages/notFound/NotFound';
import Roles from '../pages/roles/Roles';
import VerticalPage from '../pages/vertical/VerticalPage';
import PurchaseOrdersPage from '../pages/purchaseOrders/PurchaseOrdersPage';
import InvoicesPage from '../pages/invoices/InvoicesPage';
import CreateCustody from '../pages/Custody/CreateCustody';
import CustodyPage from '../pages/Custody/CustodyPage';
import PublicCustodyView from '../pages/Custody/PublicCustodyView';
import ViewCustody from '../pages/Custody/ViewCustody';
import Preferences from '../pages/preferences/Preferences';
import NotificationsPage from '../pages/preferences/NotificationsPage';
import NotificationRulesPage from '../pages/preferences/NotificationRulesPage';
import AgendaPage from '../pages/agenda/AgendaPage';
import AuditPage from '../pages/audit/AuditPage';
import PublicInventoryView from '../pages/inventories/PublicInventoryView';

const AppRouter = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingModal loading={true} />;
  }

  return (
    <Router>
      <HardwareBackButtonHandler>
        <ChunkErrorBoundary>
          {user ? <AuthorizedRoute user={user} /> : <UnauthorizedRoute />}
        </ChunkErrorBoundary>
      </HardwareBackButtonHandler>
    </Router>
  );
};

const AuthorizedRoute = ({ user }) => {
  return (
    <Routes>
      <Route path="/custody/public/:token" element={<PublicCustodyView />} />
      <Route path="/inventory/public/:id" element={<PublicInventoryView />} />
      <Route path="/inventory/public" element={<PublicInventoryView />} />
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
                <Route
                  path="/inventories/create"
                  element={<CreateInventory />}
                />
                <Route
                  path="/inventories/decommissioning"
                  element={<InventoryDecommissioning />}
                />
                <Route
                  path="/inventories/edit/:id"
                  element={<UpdateInventory />}
                />
                <Route
                  path="/inventories/view/:id"
                  element={<ViewInventory />}
                />
                <Route path="/custody" element={<CustodyPage />} />
                <Route path="/custody/create" element={<CreateCustody />} />
                <Route path="/custody/edit/:id" element={<CreateCustody />} />
                <Route path="/custody/view/:id" element={<ViewCustody />} />
                <Route path="/verticals" element={<VerticalPage />} />
                <Route
                  path="/purchase-orders"
                  element={<PurchaseOrdersPage />}
                />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/catalogs" element={<Catalogs />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/audit-logs" element={<AuditPage />} />
                <Route
                  path="/login"
                  element={<Navigate to={'/'} replace={true} />}
                />
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
      <Route path="/inventory/public/:id" element={<PublicInventoryView />} />
      <Route path="/inventory/public" element={<PublicInventoryView />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRouter;
