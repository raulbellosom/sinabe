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
}) => {
  const toggleOption = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelected(
      selected.length === options.length ? [] : options.map((o) => o[keyField]),
    );
  };

  const CustomDropdownItem = ({ name, onClick, checked }) => (
    <Dropdown.Item
      as="button"
      onClick={onClick}
      className="flex justify-between items-center text-sm"
    >
      <span>{name}</span>
      <input type="checkbox" readOnly checked={checked} className="ml-2" />
    </Dropdown.Item>
  );

  return (
    <Dropdown
      renderTrigger={() => (
        <button className="flex items-center px-4 py-2 text-white bg-sinabe-primary hover:bg-sinabe-primary/90 rounded shadow text-sm">
          <TbFilter size={18} />
          <span className="ml-2">Filtrar</span>
        </button>
      )}
      placement="bottom-end"
      className="w-64"
      dismissOnClick={false}
    >
      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
          {label}
        </h2>
      </div>
      <Dropdown.Divider />

      {showSelectAll && (
        <CustomDropdownItem
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
          key={opt[keyField]}
          name={opt[labelField]}
          onClick={() => toggleOption(opt[keyField])}
          checked={selected.includes(opt[keyField])}
        />
      ))}
    </Dropdown>
  );
};

export default FilterDropdown;
