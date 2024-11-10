import { useCombobox } from 'downshift';
import PropTypes from 'prop-types';

function AutoCompleteInput({ items = [], onSelectItem }) {
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    items,
    itemToString(item) {
      return item ? item.title : '';
    },
    onSelectedItemChange({ selectedItem }) {
      if (onSelectItem) {
        onSelectItem(selectedItem); // Pasamos el item seleccionado al callback
      }
    },
  });

  return (
    <div className="relative">
      <div className="w-72 flex flex-col gap-1">
        <label className="w-fit" {...getLabelProps()}>
          Choose your favorite book:
        </label>
        <div className="flex shadow-sm bg-white gap-0.5">
          <input
            placeholder="Best book ever"
            className="w-full p-1.5"
            {...getInputProps()}
          />
          <button
            aria-label="toggle menu"
            className="px-2"
            type="button"
            {...getToggleButtonProps()}
          >
            {isOpen ? <>&#8593;</> : <>&#8595;</>}
          </button>
        </div>
      </div>
      <ul
        className={`absolute w-72 bg-white mt-1 shadow-md max-h-80 overflow-scroll p-0 z-10 ${
          !(isOpen && items.length) && 'hidden'
        }`}
        {...getMenuProps()}
      >
        {isOpen &&
          items.map((item, index) => (
            <li
              className={`py-2 px-3 shadow-sm flex flex-col ${highlightedIndex === index && 'bg-blue-300'} ${selectedItem === item && 'font-bold'}`}
              key={item.id}
              {...getItemProps({ item, index })}
            >
              <span>{item.title}</span>
              <span className="text-sm text-gray-700">{item.author}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

AutoCompleteInput.propTypes = {
  items: PropTypes.array.isRequired, // Aseguramos que 'items' sea un array
  onSelectItem: PropTypes.func, // Callback opcional para el item seleccionado
};

AutoCompleteInput.defaultProps = {
  items: [], // Default es un array vacío
};

export default AutoCompleteInput;
