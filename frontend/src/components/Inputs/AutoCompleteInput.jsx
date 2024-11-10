import React, { useState } from "react";
import { useCombobox } from "downshift";

function AutoCompleteInput({ items = [], onSelect }) {
  // Estado local para manejar los elementos filtrados
  const [filteredItems, setFilteredItems] = useState(items);

  // Función para filtrar los elementos según la entrada del usuario
  function getItemsFilter(inputValue) {
    const lowerCasedInputValue = inputValue.toLowerCase();
    return function (item) {
      return (
        !inputValue ||
        item.title.toLowerCase().includes(lowerCasedInputValue) ||
        item.subtitle?.toLowerCase().includes(lowerCasedInputValue)
      );
    };
  }

  // Hook de Downshift para manejar el comportamiento del combobox
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
    items: filteredItems,
    onInputValueChange({ inputValue }) {
      setFilteredItems(items.filter(getItemsFilter(inputValue)));
    },
    onSelectedItemChange({ selectedItem }) {
      if (selectedItem) {
        onSelect(selectedItem);
      }
    },
    itemToString(item) {
      return item ? item.title : "";
    },
  });

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      <div className="w-72 flex flex-col gap-1">
        <label className="w-fit" {...getLabelProps()}>
          Choose your favorite field:
        </label>
        <div className="flex shadow-sm bg-white gap-0.5">
          <input
            placeholder="Select a custom field"
            className="w-full p-1.5 border rounded-l-md focus:outline-none"
            {...getInputProps()}
          />
          <button
            aria-label="toggle menu"
            className="px-2 border rounded-r-md"
            type="button"
            {...getToggleButtonProps()}
          >
            {isOpen ? <>&#8593;</> : <>&#8595;</>}
          </button>
        </div>
      </div>
      <ul
        className={`absolute w-72 bg-white mt-1 shadow-md max-h-80 overflow-scroll p-0 z-10 ${
          !(isOpen && filteredItems.length) && "hidden"
        }`}
        {...getMenuProps()}
      >
        {isOpen &&
          filteredItems.map((item, index) => (
            <li
              key={item.id}
              {...getItemProps({ item, index })}
              className={`py-2 px-3 cursor-pointer flex flex-col ${
                highlightedIndex === index ? "bg-blue-300" : ""
              } ${selectedItem === item ? "font-bold" : ""}`}
            >
              <span>{item.title}</span>
              {item.subtitle && (
                <span className="text-sm text-gray-700">{item.subtitle}</span>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default AutoCompleteInput;
