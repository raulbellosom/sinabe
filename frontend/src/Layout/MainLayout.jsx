import { useEffect } from 'react';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import Breadcrumbs from '../components/Breadcrum/Breadcrumb';
import BreadcrumbsBuilder from '../utils/BreadcrumbsBuilder';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const { breadcrumb, setBreadcrumb } = useBreadcrumb();
  const location = useLocation();

  useEffect(() => {
    const newBreadcrumb = BreadcrumbsBuilder(location.pathname);
    setBreadcrumb(newBreadcrumb);
  }, [location]);

  const hideBreadcrumb =
    location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <div className="flex flex-col flex-1 h-full bg-sinabe-gray p-4 pb-2 overflow-y-auto overflow-x-hidden">
      {!hideBreadcrumb && <Breadcrumbs breadcrumbs={breadcrumb} />}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default MainLayout;
