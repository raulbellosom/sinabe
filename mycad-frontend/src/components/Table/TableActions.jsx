import { TextInput, Dropdown} from 'flowbite-react';
import React from 'react';
import { FaFilter, FaSearch } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';
import { useCatalogContext } from '../../context/CatalogContext';
const TableActions = ({ handleSearchTerm, onCheckFilter, filters }) => {
  const { vehicleConditions } = useCatalogContext();
  function checked(value){
    console.log("checked ", value)
    onCheckFilter(value)
  }
  const filterComponent = (
    <button
    id="filterDropdownButton"
    data-dropdown-toggle="filterDropdown"
    className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
    type="button"
  >
    <FaFilter className="h-4 w-4 mr-1.5 -ml-1 text-gray-400"/>
      Filtros
    <IoIosArrowDown className='-mr-1 ml-1.5 w-5 h-5'/>
  </button>
  )
  const CustomDropdownItem = ({name}) => {
    return (
    <li className="flex items-center px-4 py-1">
      <input
        id={name}
        type="checkbox"
        checked={filters?.includes(name)}
        className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
        onChange={() => onCheckFilter(name)}
      />
      <label
        htmlFor={name}
        className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {name}
      </label>  
    </li>
    )
  }
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center md:space-x-3 space-y-3 md:space-y-0 justify-between  py-4 border-t dark:border-gray-700">
      <div className="w-full md:w-1/2">
        <form className="flex items-center">
          <div className="relative w-full">
            <TextInput
              icon={FaSearch}
              className="w-full mb-2"
              placeholder="Buscar vehículo"
              onChange={handleSearchTerm}
              type="search"
            />
          </div>
        </form>
      </div>
      <Dropdown label="Dropdown button" renderTrigger={() => filterComponent} placement='bottom-end'>
        {/* <div className='p-2 font-light border-b border-gray-200 dark:border-gray-600'> */}
        {vehicleConditions && vehicleConditions?.map((condition) => (
          <CustomDropdownItem key={condition?.id} name={condition?.name} />
        ))}
        {/* </div> */}

      </Dropdown>
    </div>
  );
};

export default React.memo(TableActions);
