import React from 'react';
import { Tabs } from 'flowbite-react';
import Models from './Models';
import Brands from './Brands';
import { BiCategory } from 'react-icons/bi';
import { HiCubeTransparent } from 'react-icons/hi';
import Types from './Types';
import Conditions from './Conditions';

const Catalogs = () => {
  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden p-2 rounded-md">
      <Tabs aria-label="Default tabs" variant="fullWidth">
        <Tabs.Item title="Modelos" icon={HiCubeTransparent}>
          <div className="h-full overflow-auto">
            <Models />
          </div>
        </Tabs.Item>
        <Tabs.Item title="Catalogos" icon={BiCategory}>
          <div className="h-full overflow-auto grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 text-3xl justify-start gap-4">
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
