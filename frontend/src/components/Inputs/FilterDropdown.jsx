// frontend/src/components/Inputs/FilterDropdown.jsx
import { Dropdown } from 'flowbite-react';
import { TbFilter } from 'react-icons/tb';
import classNames from 'classnames';

const FilterDropdown = ({
  label = 'Filtrar por',
  options = [],
  selected = [],
  setSelected,
  showSelectAll = true,
  selectAllLabel = 'Seleccionar todos',
  deselectAllLabel = 'Quitar todos',
  keyField = 'id',
  labelField = 'name',
  titleDisplay = '',
  icon = <TbFilter size={18} className="text-white" />,
  filterClassNames = '',
}) => {
  const toggleOption = (id) => {
    const newSelected = selected.includes(id)
      ? selected.filter((v) => v !== id)
      : [...selected, id];
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    const newSelected =
      selected.length === options.length ? [] : options.map((o) => o[keyField]);
    setSelected(newSelected);
  };

  const CustomDropdownItem = ({ name, onClick, checked, itemKey }) => (
    <Dropdown.Item
      as="button"
      onClick={onClick}
      className="flex justify-between items-center text-sm text-nowrap"
      key={itemKey}
    >
      <span>{name}</span>
      <input type="checkbox" readOnly checked={checked} className="ml-2" />
    </Dropdown.Item>
  );

  return (
    <Dropdown
      renderTrigger={() => (
        <button
          className={classNames(
            'w-full md:w-fit text-xs xl:text-sm p-2  shadow flex items-center justify-center rounded-md',
            {
              'text-white bg-sinabe-primary hover:bg-sinabe-primary/90':
                !filterClassNames,
            },
            filterClassNames,
          )}
        >
          {icon && <span>{icon}</span>}
          <span className="ml-2">{titleDisplay || 'Filtrar'}</span>
        </button>
      )}
      placement="bottom-end"
      className="md:min-w-72 md:w-72"
      dismissOnClick={false}
      arrowIcon={false}
    >
      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
          {label}
        </h2>
      </div>
      <Dropdown.Divider />

      {showSelectAll && (
        <CustomDropdownItem
          key="select-all-toggle" // Unique key for this specific item
          name={
            selected.length === options.length
              ? deselectAllLabel
              : selectAllLabel
          }
          onClick={toggleSelectAll}
          checked={selected.length === options.length}
        />
      )}

      <Dropdown.Divider />

      {options.map((opt) => (
        <CustomDropdownItem
          key={opt[keyField]} // Use the unique ID from the option as key
          name={opt[labelField]}
          onClick={() => toggleOption(opt[keyField])}
          checked={selected.includes(opt[keyField])}
        />
      ))}
    </Dropdown>
  );
};

export default FilterDropdown;
