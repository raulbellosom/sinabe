import React from 'react';
import TableSearchByHeader from './TableSearchByHeader';
import { TextInput, Dropdown, Label } from 'flowbite-react';
import { TbFilter } from 'react-icons/tb';
import { LuSearch } from 'react-icons/lu';
import { getButtonClassNames } from '../../utils/getButtonClassNames';
import ActionButtons from '../ActionButtons/ActionButtons';
import { IoMdRefresh } from 'react-icons/io';
import Select from 'react-select';

const TableActions = ({
  handleSearchTerm,
  onCheckFilter,
  selectedFilters,
  headers,
  deepSearch,
  setDeepSearch,
  filters,
  onRefreshData,
  brands = [],
  types = [],
  handleBrandOrTypeSelectChange,
  brandAndTypeSelected,
}) => {
  const CustomDropdownItem = ({ name }) => {
    return (
      <li className="flex items-center cursor-pointer hover:bg-neutral-100 px-4 py-1.5">
        <input
          id={name}
          type="checkbox"
          checked={selectedFilters?.includes(name)}
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
    <div className="w-full flex flex-wrap gap-4 md:gap-2 justify-stretch">
      <div className="w-full flex flex-col md:flex-row gap-4 md:gap-2 justify-between">
        <div className="w-full md:w-[40vw]">
          <form className="flex items-center">
            <div className="relative w-full">
              <TextInput
                icon={LuSearch}
                type="search"
                placeholder="Buscar"
                className="bg-transparent"
                onChange={handleSearchTerm}
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: '5px',
                  border: '1px solid #e2e8f0',
                  height: '36px',
                }}
              />
            </div>
          </form>
        </div>
        <div className="flex justify-end gap-4 md:gap-2 h-full">
          {filters && (
            <Dropdown
              renderTrigger={() => (
                <button className={getButtonClassNames('indigo', false)}>
                  <i>
                    <TbFilter size={18} />
                  </i>
                  <span className="ml-2">Filtrar</span>
                </button>
              )}
              placement="left-start"
              className="w-fit"
              outline
            >
              <>
                <div className="flex items-center px-4 py-2">
                  <h2 className="text-sm font-semibold">
                    Filtrar por Condiciones
                  </h2>
                </div>
                <Dropdown.Divider />
                <CustomDropdownItem
                  key="all"
                  name={
                    filters?.length === selectedFilters?.length
                      ? 'Quitar todos'
                      : 'Seleccionar todos'
                  }
                />
                <Dropdown.Divider />
                {filters &&
                  filters?.map((condition) => (
                    <CustomDropdownItem
                      key={condition?.id}
                      name={condition?.name}
                    />
                  ))}
              </>
            </Dropdown>
          )}
          <ActionButtons
            extraActions={[
              {
                label: 'Refrescar',
                action: onRefreshData || null,
                color: 'stone',
                icon: IoMdRefresh,
                filled: true,
              },
            ]}
          />
        </div>
      </div>
      <div className="w-full flex flex-wrap gap-4 md:gap-2 justify-start">
        {types && (
          <div className="w-full md:w-fit">
            <Label htmlFor="type" value="Tipo" />
            <Select
              id="type"
              name="type"
              placeholder="Tipo de inventario"
              options={types}
              value={brandAndTypeSelected?.type}
              onChange={(e) =>
                handleBrandOrTypeSelectChange({ key: 'type', value: e.value })
              }
            />
          </div>
        )}
        {brands && (
          <div className="w-full md:w-fit">
            <Label htmlFor="brand" value="Marca" />
            <Select
              id="brand"
              name="brand"
              placeholder="Marca del inventario"
              options={brands}
              value={brandAndTypeSelected?.brand}
              onChange={(e) =>
                handleBrandOrTypeSelectChange({ key: 'brand', value: e.value })
              }
            />
          </div>
        )}
        {deepSearch && (
          <div className="w-fit col-span-12 whitespace-nowrap">
            <Label value="Busqueda avanzada" />
            <div className="flex flex-wrap items-center gap-2">
              <TableSearchByHeader
                currentFilters={deepSearch}
                setCurrentFilters={setDeepSearch}
                headers={headers}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(TableActions);
