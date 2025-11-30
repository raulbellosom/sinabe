import React, { useState, useRef, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { GrClose } from 'react-icons/gr';
import classNames from 'classnames';

const TableHeaderFilter = ({
  options = [],
  selected = [],
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
      // Small delay to ensure position is set before showing
      requestAnimationFrame(() => {
        setIsPositioned(true);
      });
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggle = (option) => {
    const newSelected = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={classNames('p-1 rounded-md transition-colors duration-200', {
          'text-purple-600 hover:bg-purple-50': selected.length > 0,
          'text-gray-400 hover:bg-gray-100': selected.length === 0,
          'cursor-not-allowed opacity-50': disabled,
        })}
        title={placeholder}
      >
        <FaSearch className="h-3 w-3" />
        {selected.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            {selected.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={classNames(
            'fixed z-[9999] w-64 bg-white rounded-md shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-opacity duration-150',
            {
              'opacity-0 pointer-events-none': !isPositioned,
              'opacity-100': isPositioned,
            },
          )}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No hay opciones disponibles
              </div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => handleToggle(option)}
                    className="mr-2 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {option}
                  </span>
                </label>
              ))
            )}
          </div>

          {selected.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClearAll}
                className="w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center justify-center gap-2"
              >
                <GrClose size={12} />
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableHeaderFilter;
