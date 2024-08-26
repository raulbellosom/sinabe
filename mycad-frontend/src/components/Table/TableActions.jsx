import React from 'react';
import TableSearchByHeader from './TableSearchByHeader';
import { TextInput, Dropdown } from 'flowbite-react';
import { useCatalogContext } from '../../context/CatalogContext';
import { TbFilter } from 'react-icons/tb';
import ActionButtons from '../ActionButtons/ActionButtons';
import { LuSearch } from 'react-icons/lu';

const TableActions = ({
  handleSearchTerm,
  onCheckFilter,
  filters,
  headers,
  searchHeader,
  setSearchHeader,
}) => {
  const { vehicleConditions } = useCatalogContext();
  const CustomDropdownItem = ({ name }) => {
    return (
      <li className="flex items-center cursor-pointer hover:bg-neutral-100 px-4 py-1.5">
        <input
          id={name}
          type="checkbox"
          checked={filters?.includes(name)}
          className="w-4 h-4 bg-gray-100 border-gray-300 cursor-pointer rounded text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          onChange={() => onCheckFilter(name)}
        />
        <label
          htmlFor={name}
          className="ml-2 text-sm font-medium cursor-pointer text-gray-900 dark:text-gray-100"
        >
          {name}
        </label>
      </li>
    );
  };
  return (
    <div className="w-full flex flex-wrap gap-4 justify-stretch">
      <div className="w-full flex gap-4 justify-between">
        <div className="w-full md:w-[40vw]">
          <form className="flex items-center">
            <div className="relative w-full">
              <TextInput
                icon={LuSearch}
                placeholder="Buscar vehículo"
                className="bg-white"
                onChange={handleSearchTerm}
                style={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  border: '1px solid #e2e8f0',
                }}
              />
            </div>
          </form>
        </div>
        <div className="flex justify-end">
          <Dropdown
            renderTrigger={() => (
              <ActionButtons
                extraActions={[
                  {
                    label: 'Filtrar',
                    color: 'indigo',
                    icon: TbFilter,
                    action: () => {},
                  },
                ]}
              />
            )}
            placement="bottom-end"
            className="w-fit"
            outline
          >
            {vehicleConditions &&
              vehicleConditions?.map((condition) => (
                <CustomDropdownItem
                  key={condition?.id}
                  name={condition?.name}
                />
              ))}
          </Dropdown>
        </div>
      </div>
      <div className="w-full col-span-12 md:col-span-3 whitespace-nowrap flex flex-wrap">
        <TableSearchByHeader
          currentFilters={searchHeader}
          setCurrentFilters={setSearchHeader}
          headers={headers}
        />
      </div>
    </div>
  );
};

export default React.memo(TableActions);
