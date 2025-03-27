import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { FaSearch } from 'react-icons/fa';
import { MdClose, MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { searchInventories } from '../../services/api';

const GlobalInventorySearch = () => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Cada vez que cambia el input, se consulta por sugerencias con debounce
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      // Se consulta por inventarios enviando solo searchTerm
      searchInventories({ searchTerm: inputValue })
        .then((result) => {
          // Se asume que la respuesta tiene { data: [...] }
          if (result && result.data) {
            // Transformamos cada inventario en una sugerencia
            const transformed = result.data.map((item) => ({
              id: item.id,
              label:
                `${item.model?.name} - ${item.model?.type?.name} ${item.model?.brand?.name}` +
                  (item?.serialNumber ? ' - SN ' + item.serialNumber : '') +
                  (item?.activeNumber ? ' - ' + item.activeNumber : '') ||
                `Inventario ${item.id}`,
            }));
            setSuggestions(transformed);
          } else {
            setSuggestions([]);
          }
        })
        .catch((error) => {
          console.error('Error al buscar inventarios:', error);
          setSuggestions([]);
        });
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
    setSelectedSuggestion(null);
    setHighlightedIndex(-1);
  };

  const handleSelectSuggestion = (suggestion) => {
    // Redirige a la vista de detalles del inventario
    navigate(`/inventories/view/${suggestion.id}`);
    setSelectedSuggestion(suggestion);
    setShowDropdown(false);
  };

  const handleClearInput = () => {
    setInputValue('');
    setSelectedSuggestion(null);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showDropdown) {
        setShowDropdown(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev + 1 >= suggestions.length ? 0 : prev + 1,
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!showDropdown) {
        setShowDropdown(true);
        setHighlightedIndex(suggestions.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev - 1 < 0 ? suggestions.length - 1 : prev - 1,
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (
        showDropdown &&
        highlightedIndex >= 0 &&
        highlightedIndex < suggestions.length
      ) {
        // Si hay sugerencia resaltada, se selecciona y se redirige a los detalles
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else {
        // Si no se selecciona sugerencia, se redirige a la vista general pasando searchTerm
        const query = inputValue.trim();
        if (query !== '') {
          navigate(`/inventories?searchTerm=${encodeURIComponent(query)}`);
        }
      }
      // Borrar el inputText después de ejecutar la función correspondiente
      handleClearInput();
    }
  };

  // Cierra el dropdown si se hace click fuera del componente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={inputRef}>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar inventario..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {inputValue && (
          <MdClose
            size={22}
            onClick={handleClearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-neutral-500"
          />
        )}
        <MdOutlineKeyboardArrowDown
          size={24}
          onClick={() => setShowDropdown((prev) => !prev)}
          className={classNames(
            'absolute right-8 top-1/2 transform -translate-y-1/2 cursor-pointer',
            { 'rotate-180': showDropdown },
          )}
        />
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 bg-white rounded-md shadow-lg absolute z-30 w-full">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={classNames(
                'py-2 px-4 text-sm cursor-pointer flex justify-between items-center border-b border-neutral-200 transition duration-100 hover:bg-gray-100',
                {
                  'bg-blue-500 text-white':
                    selectedSuggestion &&
                    selectedSuggestion.id === suggestion.id,
                  'bg-gray-200':
                    index === highlightedIndex &&
                    (!selectedSuggestion ||
                      selectedSuggestion.id !== suggestion.id),
                },
              )}
            >
              {suggestion.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalInventorySearch;
