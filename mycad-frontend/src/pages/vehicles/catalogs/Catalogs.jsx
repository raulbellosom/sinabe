import React from 'react';
import { Tabs } from 'flowbite-react';
import { HiCubeTransparent } from 'react-icons/hi';
import { BiCategory } from 'react-icons/bi';
const Models = React.lazy(() => import('./Models'));
const Brands = React.lazy(() => import('./Brands'));
const Types = React.lazy(() => import('./Types'));
const Conditions = React.lazy(() => import('./Conditions'));

const Catalogs = () => {
  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden rounded-md">
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
