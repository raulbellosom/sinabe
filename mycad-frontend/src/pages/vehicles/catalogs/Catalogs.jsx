import React, { useState } from 'react';
import { Tabs } from 'flowbite-react';
import Models from './Models';
import Brands from './Brands';
import { BiCategory } from 'react-icons/bi';
import { HiCubeTransparent } from 'react-icons/hi';
import Types from './Types';
import Conditions from './Conditions';

const Catalogs = () => {
  const [view, setView] = useState('models');

  const handleTabChange = (tab) => {
    setView(tab);
  };

  return (
    <div className="bg-white p-2 overflow-hidden h-full min-h-full rounded-md">
      <Tabs aria-label="Default tabs" variant="fullWidth">
        <Tabs.Item
          active={view === 'models'}
          onClick={() => handleTabChange('models')}
          title="Modelos"
          icon={HiCubeTransparent}
        >
          <Models />
        </Tabs.Item>
        <Tabs.Item
          active={view === 'types'}
          onClick={() => handleTabChange('types')}
          title="Catalogos"
          icon={BiCategory}
        >
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 text-3xl justify-start gap-4">
            <Types />
            <Brands />
            <Conditions />
          </div>
        </Tabs.Item>
      </Tabs>
    </div>
  );
};

export default Catalogs;
