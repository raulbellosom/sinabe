import React from 'react';
import { TextInput, Dropdown, FloatingLabel } from 'flowbite-react';
import { FaFilter, FaSearch } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import { useCatalogContext } from '../../context/CatalogContext';
import ActionButton from '../ActionButtons/ActionButtons';

const TableActions = ({
  handleSearchTerm,
  onCheckFilter,
  filters,
  actions,
}) => {
  const { vehicleConditions } = useCatalogContext();

  const filterComponent = (
    <button
      id="filterDropdownButton"
      data-dropdown-toggle="filterDropdown"
      className="w-fit md:w-auto border-none flex items-center text-gray-900 justify-center py-2 px-4 text-sm font-medium focus:outline-none bg-white rounded-lg hover:bg-purple-200 hover:text-purple-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
      type="button"
    >
      <span>
        <FaFilter className="h-4 w-4 mr-1.5 -ml-1" />
      </span>
      <span className="md:hidden lg:block">Filtros</span>
      <IoIosArrowDown className="-mr-1 ml-1.5 w-5 h-5" />
    </button>
  );
  const CustomDropdownItem = ({ name }) => {
    return (
      <li className="flex items-center hover:bg-neutral-100 px-4 py-1.5">
        <input
          id={name}
          type="checkbox"
          checked={filters?.includes(name)}
          className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          onChange={() => onCheckFilter(name)}
        />
        <label
          htmlFor={name}
          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {name}
        </label>
      </li>
    );
  };
  return (
    <div className="grid grid-cols-12 justify-center lg:flex gap-2 md:flex-row items-center md:items-center md:justify-stretch">
      <div className="w-full col-span-8 md:w-1/2">
        <form className="flex items-center">
          <div className="relative w-full">
            <TextInput
              icon={FaSearch}
              placeholder="Buscar vehículo"
              className="bg-white"
              style={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '0',
                borderBottom: '1px solid #e2e8f0',
              }}
            />
          </div>
        </form>
      </div>
      <Dropdown
        label="Dropdown button"
        renderTrigger={() => filterComponent}
        placement="bottom-end"
        className="w-fit col-span-4"
      >
        {/* <div className='p-2 font-light border-b border-gray-200 dark:border-gray-600'> */}
        {vehicleConditions &&
          vehicleConditions?.map((condition) => (
            <CustomDropdownItem key={condition?.id} name={condition?.name} />
          ))}
        {/* </div> */}
      </Dropdown>
      <div className="-order-1 md:order-3 col-span-12 md:col-span-8 flex justify-center">
        <ActionButton extraActions={actions} />
      </div>
    </div>
  );
};

export default React.memo(TableActions);
