// components/InventoryComponents/InventorySearchInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { FaSearch } from 'react-icons/fa';
import { MdClose, MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { searchInventories } from '../../services/api';

const InventorySearchInput = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchInventories({ searchTerm: inputValue }).then((res) => {
        const items = res?.data || [];
        setSuggestions(
          items.map((item) => ({
            id: item.id,
            raw: item,
            label:
              `${item.model?.name || 'Modelo'} - ${item.model?.type?.name || 'Tipo'} ${item.model?.brand?.name || 'Marca'}` +
              (item.serialNumber ? ' · SN ' + item.serialNumber : '') +
              (item.activeNumber ? ' · ' + item.activeNumber : ''),
          })),
        );
      });
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleSelect = (suggestion) => {
    onSelect?.(suggestion.raw); // se pasa el inventario completo
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev + 1 >= suggestions.length ? 0 : prev + 1,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev - 1 < 0 ? suggestions.length - 1 : prev - 1,
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    }
  };

  return (
    <div className="relative w-full" ref={inputRef}>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar inventario..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {inputValue && (
          <MdClose
            size={22}
            onClick={() => {
              setInputValue('');
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-neutral-500"
          />
        )}
        {suggestions.length > 0 && (
          <MdOutlineKeyboardArrowDown
            size={24}
            onClick={() => setShowDropdown((prev) => !prev)}
            className={classNames(
              'absolute right-8 top-1/2 transform -translate-y-1/2 cursor-pointer',
              { 'rotate-180': !showDropdown },
            )}
          />
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 bg-white rounded-md shadow-lg absolute z-30 w-full">
          {suggestions.map((s, i) => (
            <div
              key={s.id}
              className={classNames(
                'py-2 px-4 text-sm cursor-pointer hover:bg-gray-100',
                { 'bg-gray-200': highlightedIndex === i },
              )}
              onClick={() => handleSelect(s)}
            >
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventorySearchInput;
