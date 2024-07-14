import React from 'react';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import Breadcrumbs from '../components/Breadcrum/Breadcrumb';

const MainLayout = ({ children }) => {
  const { breadcrumb } = useBreadcrumb();

  return (
    <div className="p-4">
      <Breadcrumbs breadcrumbs={breadcrumb} />
      <main className="py-4">{children}</main>
    </div>
  );
};

export default MainLayout;
