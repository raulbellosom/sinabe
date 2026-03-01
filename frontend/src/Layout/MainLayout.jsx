import { useEffect } from 'react';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import Breadcrumbs from '../components/Breadcrum/Breadcrumb';
import BreadcrumbsBuilder from '../utils/BreadcrumbsBuilder';
import { useLocation } from 'react-router-dom';
import FloatingInventoryCart from '../components/FloatingInventoryCart/FloatingInventoryCart';
import InventoryAssignmentModal from '../components/InventoryAssignment/InventoryAssignmentModal';
import SwipeNavigationHandler from '../components/SwipeNavigation/SwipeNavigationHandler';

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
    <SwipeNavigationHandler>
      <div className="flex h-full flex-1 flex-col overflow-x-hidden overflow-y-auto bg-[color:var(--background)] pt-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] text-[color:var(--foreground)] md:pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {!hideBreadcrumb && <Breadcrumbs breadcrumbs={breadcrumb} />}
        <div className="flex-1">{children}</div>

        {/* Carrito flotante y modal de asignación */}
        <FloatingInventoryCart />
        <InventoryAssignmentModal />
      </div>
    </SwipeNavigationHandler>
  );
};

export default MainLayout;
