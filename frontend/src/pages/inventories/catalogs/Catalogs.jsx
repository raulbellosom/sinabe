import React, { useEffect, useRef, Suspense } from 'react';
import { Tabs } from 'flowbite-react';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import NotFound from '../../notFound/NotFound';

import {
  Box,
  FormInput,
  Layers,
  List,
  MapPin,
  Tag,
} from 'lucide-react';

const Models = React.lazy(() => import('./Models'));
const Brands = React.lazy(() => import('./Brands'));
const Types = React.lazy(() => import('./Types'));
const Conditions = React.lazy(() => import('./Conditions'));
const CustomFields = React.lazy(() => import('./CustomFields'));
const Locations = React.lazy(() => import('./Locations'));

const Catalogs = () => {
  const tabsRef = useRef(null);

  useEffect(() => {
    const tab = localStorage.getItem('selectedTab');
    if (tab && tabsRef.current) {
      tabsRef.current.setActiveTab(parseInt(tab));
    }
  }, []);

  const handleTabChange = (tabIndex) => {
    localStorage.setItem('selectedTab', tabIndex);
  };

  const isViewModelPermission = useCheckPermissions('view_inventories_models');
  const isViewBrandPermission = useCheckPermissions('view_inventories_brands');
  const isViewTypePermission = useCheckPermissions('view_inventories_types');
  const isViewConditionPermission = useCheckPermissions(
    'view_inventories_conditions',
  );
  const isCreateCustomFieldPermission = useCheckPermissions(
    'view_inventories_custom_fields',
  );

  // TODO: Add permission check for locations when available
  const isViewLocationPermission = { hasPermission: true };

  const hasAnyPermission =
    isViewModelPermission.hasPermission ||
    isViewBrandPermission.hasPermission ||
    isViewTypePermission.hasPermission ||
    isViewConditionPermission.hasPermission ||
    isCreateCustomFieldPermission.hasPermission ||
    isViewLocationPermission.hasPermission;

  if (!hasAnyPermission) {
    return <NotFound />;
  }

  return (
    <div className="w-full bg-[color:var(--surface)] rounded-lg shadow-md overflow-hidden min-h-[80vh]">
      <Tabs
        aria-label="Catalog tabs"
        variant="underline"
        ref={tabsRef}
        onActiveTabChange={handleTabChange}
        className="py-2 bg-[color:var(--surface)] border-b border-[color:var(--border)]"
      >
        {isViewModelPermission.hasPermission && (
          <Tabs.Item title="Modelos" icon={Box}>
            <Suspense
              fallback={
                <div className=" text-center dark:text-white">
                  Cargando modelos...
                </div>
              }
            >
              <Models />
            </Suspense>
          </Tabs.Item>
        )}
        {isViewBrandPermission.hasPermission && (
          <Tabs.Item title="Marcas" icon={Tag}>
            <Suspense
              fallback={
                <div className=" text-center dark:text-white">
                  Cargando marcas...
                </div>
              }
            >
              <Brands />
            </Suspense>
          </Tabs.Item>
        )}
        {isViewTypePermission.hasPermission && (
          <Tabs.Item title="Tipos" icon={Layers}>
            <Suspense
              fallback={
                <div className=" text-center dark:text-white">
                  Cargando tipos...
                </div>
              }
            >
              <Types />
            </Suspense>
          </Tabs.Item>
        )}
        {isViewLocationPermission.hasPermission && (
          <Tabs.Item title="Ubicaciones" icon={MapPin}>
            <Suspense
              fallback={
                <div className=" text-center dark:text-white">
                  Cargando ubicaciones...
                </div>
              }
            >
              <Locations />
            </Suspense>
          </Tabs.Item>
        )}
        {isViewConditionPermission.hasPermission && (
          <Tabs.Item title="Condición" icon={List}>
            <Suspense
              fallback={
                <div className=" text-center dark:text-white">
                  Cargando condiciones...
                </div>
              }
            >
              <Conditions />
            </Suspense>
          </Tabs.Item>
        )}
        {isCreateCustomFieldPermission.hasPermission && (
          <Tabs.Item title="Campos" icon={FormInput}>
            <Suspense
              fallback={
                <div className=" text-center dark:text-white">
                  Cargando campos personalizados...
                </div>
              }
            >
              <CustomFields />
            </Suspense>
          </Tabs.Item>
        )}
      </Tabs>
    </div>
  );
};

export default Catalogs;
