import React, { useEffect, useRef, useState } from 'react';
import { Tabs } from 'flowbite-react';
import { HiCubeTransparent } from 'react-icons/hi';
import { BiCategory } from 'react-icons/bi';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { FaListAlt } from 'react-icons/fa';
const Models = React.lazy(() => import('./Models'));
const Brands = React.lazy(() => import('./Brands'));
const Types = React.lazy(() => import('./Types'));
const Conditions = React.lazy(() => import('./Conditions'));

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

  return (
    <Tabs
      aria-label="Default tabs"
      variant="fullWidth"
      ref={tabsRef}
      onActiveTabChange={(tab) => handleTabChange(tab)}
      className="text-nowrap overflow-x-auto"
    >
      <Tabs.Item title="Modelos" icon={HiCubeTransparent}>
        <div className="h-full overflow-hidden">
          <Models />
        </div>
      </Tabs.Item>
      <Tabs.Item title="Marcas de Vehículos" icon={PiTrademarkRegisteredBold}>
        <div className="h-full overflow-hidden">
          <Brands />
        </div>
      </Tabs.Item>
      <Tabs.Item title="Tipos de Vehículo" icon={BiCategory}>
        <div className="h-full overflow-hidden">
          <Types />
        </div>
      </Tabs.Item>
      <Tabs.Item title="Condicion del Vehículo" icon={FaListAlt}>
        <div className="h-full overflow-hidden">
          <Conditions />
        </div>
      </Tabs.Item>
    </Tabs>
  );
};

export default Catalogs;
