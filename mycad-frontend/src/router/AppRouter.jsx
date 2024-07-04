import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/login/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import Vehicles from '../pages/vehicles/Vehicles';
import Sidebar from '../components/sidebar/Sidebar';
// import Navbar from '../components/navbar/Navbar';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex h-screen">
          <Routes className="flex-1">
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={
                <>
                  {/* <Navbar /> */}
                  <div className="flex flex-1 p-4 overflow-y-auto">
                    <Sidebar />
                    <Routes>
                      <Route
                        path="/dashboard"
                        element={<ProtectedRoute element={Dashboard} />}
                      />
                      <Route
                        path="/vehicles"
                        element={<ProtectedRoute element={Vehicles} />}
                      />
                    </Routes>
                  </div>
                </>
              }
            />
          </Routes>
        </div>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
