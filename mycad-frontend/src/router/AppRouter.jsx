import React, { Suspense, lazy, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from '../pages/login/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Vehicles from '../pages/vehicles/Vehicles';
import NotFound from '../pages/notFound/NotFound';
import ProtectedRoute from './ProtectedRoute';
import LoadingModal from '../components/loadingModal/LoadingModal';
import CreateVehicle from '../pages/vehicles/CreateVehicle';
const Sidebar = lazy(() => import('../components/sidebar/Sidebar'));

const AppRouter = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-dvh h-screen overflow-hidden w-full">
      <Router>
        <Suspense fallback={<LoadingModal loading={true} />}>
          {user ? <AuthorizedRoute user={user} /> : <UnauthorizedRoute />}
        </Suspense>
      </Router>
    </div>
  );
};

const AuthorizedRoute = ({ user }) => {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <div className="flex h-screen overflow-hidden">
            <Sidebar>
              <Routes>
                <Route element={<ProtectedRoute user={user} />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/vehicles/create" element={<CreateVehicle />} />
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
          </div>
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
