import React, { useState } from 'react';
import { Tabs } from 'flowbite-react';
import Models from './Models';
import { BiCategory } from 'react-icons/bi';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { HiCubeTransparent } from 'react-icons/hi';

const Catalogs = () => {
  const [view, setView] = useState('models');

  const handleTabChange = (tab) => {
    setView(tab);
  };

  return (
    <div className="bg-white p-2">
      <Tabs aria-label="Default tabs" variant="underline">
        <Tabs.Item
          active={view === 'models'}
          onClick={() => handleTabChange('models')}
          title="Modelos"
          icon={HiCubeTransparent}
        >
          <Models />
        </Tabs.Item>
        <Tabs.Item
          active={view === 'brands'}
          onClick={() => handleTabChange('brands')}
          title="Marcas"
          icon={PiTrademarkRegisteredBold}
        >
          Brands
        </Tabs.Item>
        <Tabs.Item
          active={view === 'types'}
          onClick={() => handleTabChange('types')}
          title="Tipos de Vehiculos"
          icon={BiCategory}
        >
          Types
        </Tabs.Item>
      </Tabs>
    </div>
  );
};

export default Catalogs;
