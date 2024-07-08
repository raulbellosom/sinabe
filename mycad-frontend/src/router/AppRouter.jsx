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
const Sidebar = lazy(() => import('../components/sidebar/Sidebar'));
import LoadingModal from '../components/loadingModal/LoadingModal';

const AppRouter = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="h-screen w-full">
      <Router>
        <Suspense fallback={<LoadingModal loading={true} />}>
          <div className="flex h-screen w-full">
            {user ? <AuthorizedRoute user={user} /> : <UnauthorizedRoute />}
          </div>
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
          <>
            <Sidebar>
              <Routes>
                <Route element={<ProtectedRoute user={user} />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/vehicles" element={<Vehicles />} />
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
