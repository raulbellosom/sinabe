import React, { Suspense, useContext } from 'react';
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

import Login from '../pages/login/Login';
import Dashboard from '../pages/dashboard/Dashboard';
// import Inventories from '../pages/inventories/Inventories';
import InventoriesPage from '../pages/inventories/InventoriesPage';
import CreateInventory from '../pages/inventories/CreateInventory';
import UpdateInventory from '../pages/inventories/UpdateInventory';
import ViewInventory from '../pages/inventories/ViewInventory';
import InventoryDecommissioning from '../pages/inventories/InventoryDecommissioning';
import InventoryMigration from '../pages/inventories/InventoryMigration';
import Catalogs from '../pages/inventories/catalogs/Catalogs';
import Account from '../pages/account/Account';
// import Users from '../pages/users/Users';
import UsersPage from '../pages/users/UsersPage';
import NotFound from '../pages/notFound/NotFound';
import Roles from '../pages/roles/Roles';
import ProjectsPage from '../pages/projects/ProjectsPage';
import CreateProjectPage from '../pages/projects/CreateProjectPage';
import EditProjectPage from '../pages/projects/EditProjectPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import VerticalPage from '../pages/vertical/VerticalPage';
import PurchaseOrdersPage from '../pages/purchaseOrders/PurchaseOrdersPage';
import InvoicesPage from '../pages/invoices/InvoicesPage';
import CreateCustody from '../pages/Custody/CreateCustody';
import CustodyPage from '../pages/Custody/CustodyPage';
import Preferences from '../pages/preferences/Preferences';

const AppRouter = () => {
  const { user, loading } = useContext(AuthContext);

  // Mostrar loading mientras verifica la autenticación
  if (loading) {
    return <LoadingModal loading={true} />;
  }

  return (
    <>
      <Router>
        <Suspense fallback={<LoadingModal loading={true} />}>
          {user ? <AuthorizedRoute user={user} /> : <UnauthorizedRoute />}
        </Suspense>
      </Router>
    </>
  );
};

const AuthorizedRoute = ({ user }) => {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <>
            <Sidebar>
              <Routes>
                <Route element={<ProtectedRoute user={user} />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/account-settings" element={<Account />} />
                  <Route path="/preferences" element={<Preferences />} />
                  <Route path="/users" element={<UsersPage />} />
                  {/* <Route path="/inventories" element={<Inventories />} /> */}
                  <Route path="/inventories" element={<InventoriesPage />} />
                  <Route
                    path="/inventories/create"
                    element={<CreateInventory />}
                  />
                  <Route
                    path="/inventories/decommissioning"
                    element={<InventoryDecommissioning />}
                  />
                  {/* <Route
                    path="/inventories/migrate"
                    element={<InventoryMigration />}
                  /> */}
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
                  <Route path="/verticals" element={<VerticalPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route
                    path="/projects/create"
                    element={<CreateProjectPage />}
                  />
                  <Route
                    path="/projects/edit/:id"
                    element={<EditProjectPage />}
                  />
                  <Route
                    path="/projects/view/:id"
                    element={<ProjectDetailPage />}
                  />
                  {/* 🆕 Rutas independientes para Finanzas */}
                  <Route
                    path="/purchase-orders"
                    element={<PurchaseOrdersPage />}
                  />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/catalogs" element={<Catalogs />} />
                  <Route path="/roles" element={<Roles />} />
                  <Route
                    path="/login"
                    element={
                      <>
                        <Navigate to={'/'} replace={true} />
                      </>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Sidebar>
          </>
        }
      />
    </Routes>
  );
};

const UnauthorizedRoute = () => {
  return (
    <Routes>
      <Route path="*" element={<Login />} />
    </Routes>
  );
};

export default AppRouter;
