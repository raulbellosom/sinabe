import React, { useEffect, useRef } from 'react';
import { Tabs } from '../../../components/ui/flowbite';
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

import Models from './Models';
import Brands from './Brands';
import Types from './Types';
import Conditions from './Conditions';
import CustomFields from './CustomFields';
import Locations from './Locations';

const Catalogs = () => {
  const tabsRef = useRef(null);

  useEffect(() => {
    const tab = localStorage.getItem('selectedTab');
    if (tab && tabsRef.current) {
      tabsRef.current.setActiveTab(parseInt(tab, 10));
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
            <Models />
          </Tabs.Item>
        )}
        {isViewBrandPermission.hasPermission && (
          <Tabs.Item title="Marcas" icon={Tag}>
            <Brands />
          </Tabs.Item>
        )}
        {isViewTypePermission.hasPermission && (
          <Tabs.Item title="Tipos" icon={Layers}>
            <Types />
          </Tabs.Item>
        )}
        {isViewLocationPermission.hasPermission && (
          <Tabs.Item title="Ubicaciones" icon={MapPin}>
            <Locations />
          </Tabs.Item>
        )}
        {isViewConditionPermission.hasPermission && (
          <Tabs.Item title="Condición" icon={List}>
            <Conditions />
          </Tabs.Item>
        )}
        {isCreateCustomFieldPermission.hasPermission && (
          <Tabs.Item title="Campos" icon={FormInput}>
            <CustomFields />
          </Tabs.Item>
        )}
      </Tabs>
    </div>
  );
};

export default Catalogs;
