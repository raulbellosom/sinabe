import React, { Suspense, lazy, useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AuthContext from '../context/AuthContext';
const Sidebar = lazy(() => import('../components/sidebar/Sidebar'));
const Login = lazy(() => import('../pages/login/Login'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const Vehicles = lazy(() => import('../pages/vehicles/Vehicles'));
const NotFound = lazy(() => import('../pages/notFound/NotFound'));
const ProtectedRoute = lazy(() => import('./ProtectedRoute'));
const LoadingModal = lazy(
  () => import('../components/loadingModal/LoadingModal'),
);
const CreateVehicle = lazy(() => import('../pages/vehicles/CreateVehicle'));
const UpdateVehicle = lazy(() => import('../pages/vehicles/UpdateVehicle'));
const ViewVehicle = lazy(() => import('../pages/vehicles/ViewVehicle'));
const Catalogs = lazy(() => import('../pages/vehicles/catalogs/Catalogs'));

const AppRouter = () => {
  const { user } = useContext(AuthContext);

  return (
    // <div className="min-h-dvh h-screen overflow-hidden w-full">
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
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/vehicles/create" element={<CreateVehicle />} />
                  <Route
                    path="/vehicles/edit/:id"
                    element={<UpdateVehicle />}
                  />
                  <Route path="/vehicles/view/:id" element={<ViewVehicle />} />
                  <Route path="/catalogs" element={<Catalogs />} />
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
