import React, { useEffect, useRef, useState } from 'react';
import { Tabs } from 'flowbite-react';
import { HiCubeTransparent } from 'react-icons/hi';
import { BiCategory } from 'react-icons/bi';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { FaListAlt } from 'react-icons/fa';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import NotFound from '../../notFound/NotFound';
import { RiInputField } from 'react-icons/ri';
const Models = React.lazy(() => import('./Models'));
const Brands = React.lazy(() => import('./Brands'));
const Types = React.lazy(() => import('./Types'));
const Conditions = React.lazy(() => import('./Conditions'));
const CustomFields = React.lazy(() => import('./CustomFields'));

const Catalogs = () => {
  const tabsRef = useRef(null);

  useEffect(() => {
    const tab = localStorage.getItem('selectedTab');
    if (tab) {
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

  return (
    <Tabs
      aria-label="Default tabs"
      variant="fullWidth"
      ref={tabsRef}
      onActiveTabChange={(tab) => handleTabChange(tab)}
      className="text-nowrap overflow-x-auto "
    >
      {isViewModelPermission.hasPermission && (
        <Tabs.Item title="Modelos" icon={HiCubeTransparent}>
          <div className="h-full overflow-hidden">
            <Models />
          </div>
        </Tabs.Item>
      )}
      {isViewBrandPermission.hasPermission && (
        <Tabs.Item
          title="Marcas de Inventarios"
          icon={PiTrademarkRegisteredBold}
        >
          <div className="h-full overflow-hidden">
            <Brands />
          </div>
        </Tabs.Item>
      )}
      {isViewTypePermission.hasPermission && (
        <Tabs.Item title="Tipos de Inventarios" icon={BiCategory}>
          <div className="h-full overflow-hidden">
            <Types />
          </div>
        </Tabs.Item>
      )}
      {isViewConditionPermission.hasPermission && (
        <Tabs.Item title="Condicion del Inventario" icon={FaListAlt}>
          <div className="h-full overflow-hidden">
            <Conditions />
          </div>
        </Tabs.Item>
      )}

      {isCreateCustomFieldPermission.hasPermission && (
        <Tabs.Item title="Campos Personalizados" icon={RiInputField}>
          <div className="h-full overflow-hidden">
            <CustomFields />
          </div>
        </Tabs.Item>
      )}
      {!isViewModelPermission.hasPermission &&
        !isViewBrandPermission.hasPermission &&
        !isViewTypePermission.hasPermission &&
        !isViewConditionPermission.hasPermission && (
          <Tabs.Item title="">
            <NotFound />
          </Tabs.Item>
        )}
    </Tabs>
  );
};

export default Catalogs;
