// src/router/AppRouter.jsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Vehicles from '../pages/vehicles/Vehicles';
import NotFound from '../pages/notFound/NotFound';
import Sidebar from '../components/sidebar/Sidebar';
// import Navbar from '../components/navbar/Navbar';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <div className="h-screen w-full">
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex h-screen w-full">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="*"
                element={
                  <>
                    {/* <Navbar /> */}
                    <Sidebar />
                    <Routes>
                      <Route
                        path="/"
                        element={<ProtectedRoute element={Dashboard} />}
                      />
                      <Route
                        path="/dashboard"
                        element={<ProtectedRoute element={Dashboard} />}
                      />
                      <Route
                        path="/vehicles"
                        element={<ProtectedRoute element={Vehicles} />}
                      />
                      <Route
                        path="*"
                        element={<ProtectedRoute element={NotFound} />}
                      />
                    </Routes>
                  </>
                }
              />
            </Routes>
          </div>
        </Suspense>
      </Router>
    </div>
  );
};

export default AppRouter;
