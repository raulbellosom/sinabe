import { Card, TextInput } from 'flowbite-react';
import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import ActionButtons from '../ActionButtons/ActionButtons';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import classNames from 'classnames';

const CatalogList = ({
  data = [],
  title,
  onEdit = () => {},
  onRemove = () => {},
  onDisable = () => {},
  onEnable = () => {},
  onCreate = () => {},
}) => {
  const [search, setSearch] = useState('');
  const [colapse, setColapse] = useState(true);
  const [colapseText, setColapseText] = useState(false);
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleColapse = () => {
    setColapse(!colapse);
  };

  useEffect(() => {
    if (innerWidth < 640) {
      setColapse(false);
      setColapseText(true);
    }
  }, []);

  return (
    <Card className="w-full flex-1 overflow-hidden">
      <div className="mb-2 flex items-center justify-between">
        <h5 className="truncate text-base md:text-lg w-full font-bold leading-none text-orange-500 dark:text-white">
          {title}
        </h5>
        <ActionButtons
          onCreate={onCreate}
          extraActions={[
            {
              label: '',
              action: handleColapse,
              color: 'stone',
              icon: colapse ? FaChevronUp : FaChevronDown,
            },
          ]}
        />
      </div>
      <div
        className={classNames(
          'overflow-hidden transition-all duration-500 ease-in-out',
          colapse ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <TextInput
          className="w-full mb-2"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-[45vh] overflow-y-auto">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData &&
              filteredData.length > 0 &&
              filteredData.map((item) => (
                <li key={item.id} className="py-3 sm:py-4">
                  <div className="flex justify-between text-wrap items-center space-x-4">
                    <div className="min-w-0 inline-flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.count} {item.count > 1 ? 'Vehiculos' : 'Vehiculo'}
                      </p>
                    </div>
                    <ActionButtons
                      position="center"
                      onEdit={() => onEdit(item)}
                      onRemove={() => onRemove(item)}
                      onDisable={() => onDisable(item)}
                      onEnable={() => onEnable(item)}
                      labelEdit={colapseText ? ' ' : null}
                      labelRemove={colapseText ? ' ' : null}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

CatalogList.Skeleton = () => {
  return (
    <Card className="w-full flex-1 overflow-hidden">
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-base md:text-xl w-full font-bold leading-none text-orange-500 dark:text-white">
          <Skeleton width={200} />
        </h5>
        <ActionButtons onCreate={() => {}} />
      </div>
      <div className="overflow-hidden">
        <Skeleton height={32} className="w-full mb-2" />
        <div className="max-h-[45vh] overflow-y-auto">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 10 }).map((_, idx) => (
              <li key={idx} className="py-3 sm:py-4">
                <div className="flex items-center space-x-4">
                  <div className="min-w-0 flex-1">
                    <Skeleton width={150} />
                    <Skeleton width={80} />
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                    <ActionButtons onEdit={() => {}} onRemove={() => {}} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default CatalogList;
