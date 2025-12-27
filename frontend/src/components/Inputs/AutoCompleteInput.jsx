import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ErrorMessage } from 'formik';
import { MdClose, MdOutlineKeyboardArrowDown } from 'react-icons/md';
import classNames from 'classnames';
import { Label } from 'flowbite-react';

const Dropdown = ({
  options,
  onSelect,
  selectedOption,
  itemsClassName,
  highlightedIndex,
}) => {
  return (
    <div className="mt-2 pt-1 min-w-full max-h-[50dvh] overflow-y-auto border border-gray-300 bg-white rounded-md shadow-lg absolute z-30">
      {options.map((option, i) => (
        <div
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(option);
          }}
          className={classNames(
            'py-2 px-4 text-sm cursor-pointer border-b border-b-neutral-100 flex gap-1 justify-between items-center rounded-lg transition ease-in-out duration-100 mx-2',
            {
              'bg-blue-500 text-white': selectedOption?.value === option.value,
              'bg-gray-200':
                i === highlightedIndex &&
                selectedOption?.value !== option.value,
              'hover:bg-purple-800 hover:text-white':
                selectedOption?.value !== option.value,
              'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20':
                option.isSelected && selectedOption?.value !== option.value,
            },
            { [itemsClassName]: itemsClassName },
          )}
        >
          <div className="flex flex-col">
            <span className="font-medium">{option.label}</span>
            {option.isSelected && (
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                YA AGREGADO
              </span>
            )}
          </div>
          {option.isSelected && (
            <span className="text-green-500 dark:text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const AutocompleteInput = ({
  field,
  form = {},
  options,
  placeholder = 'Escribe aquí...',
  className,
  label,
  itemsClassName,
  icon: Icon,
  disabled,
  isClearable,
  // Nuevas props para la opción "Otro"
  allowOther, // Boolean: si es true, se muestra la opción "Otro"
  onOtherSelected, // Función a llamar cuando se selecciona "Otro"
  // Dynamic search props
  onSearch,
  isLoading,
  onFocusSearch,
}) => {
  // Provide defaults for form properties
  const {
    touched = {},
    errors = {},
    setFieldValue = () => {},
    setFieldTouched = () => {},
  } = form;
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);

  const prevFieldValueRef = useRef(field.value);

  useEffect(() => {
    // Detect change in field.value
    const prevValue = prevFieldValueRef.current;
    const valueChanged = prevValue !== field.value;

    if (options.length) {
      // Case 1: Field has a value
      if (field.value || field.value === 0) {
        const option = options.find((opt) => opt.value == field.value);
        if (option) {
          setSelectedOption(option);
          // Only update input if it doesn't match, or if value changed externally
          if (!inputValue || selectedOption?.value !== option.value) {
            setInputValue(option.label);
          }
        } else if (
          valueChanged &&
          prevValue !== null &&
          prevValue !== undefined &&
          prevValue !== ''
        ) {
          // If field.value has a value but no matching option is found, and it changed from a non-empty state,
          // it means the option might have been removed or is invalid. Clear local state.
          setSelectedOption(null);
          setInputValue('');
        }
      }
      // Case 2: Field value became empty (Reset detected)
      else if (
        valueChanged &&
        (prevValue || prevValue === 0) &&
        !field.value &&
        field.value !== 0
      ) {
        // Only clear if the value actually CHANGED from a truthy/0 value to empty
        // This protects against clearing during typing (where value stays empty)
        // or initial load (where value starts empty)
        setSelectedOption(null);
        setInputValue('');
      }
    } else {
      // Fallback for no options (rare but possible) - Same reset logic
      if (
        valueChanged &&
        (prevValue || prevValue === 0) &&
        !field.value &&
        field.value !== 0
      ) {
        setSelectedOption(null);
        setInputValue('');
      }
    }

    // Update ref for next run
    prevFieldValueRef.current = field.value;
  }, [field.value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
        setFieldTouched(field.name, true);
        if (!selectedOption && inputValue && !onSearch) {
          setFieldValue(field.name, inputValue);
        }
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedOption, inputValue, onSearch]);

  const normalizeString = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Filtrar opciones y agregar la opción "Otro" si corresponde
  const filtered = useMemo(() => {
    if (onSearch) return options; // Dynamic options are already filtered by backend

    const normalizedInput = normalizeString(inputValue).toLowerCase();
    const filteredList = options?.filter((option) => {
      const labelMatch = normalizeString(option.label)
        .toLowerCase()
        .includes(normalizedInput);
      const searchTermsMatch =
        option.searchTerms &&
        normalizeString(option.searchTerms)
          .toLowerCase()
          .includes(normalizedInput);
      return labelMatch || searchTermsMatch;
    });

    // Si allowOther es true, se agrega la opción "Otro" al final de la lista
    if (allowOther) {
      filteredList.push({
        label: 'Otro',
        value: 'otro',
        isOther: true, // Propiedad para identificar la opción "Otro"
      });
    }
    return filteredList;
  }, [inputValue, options, allowOther, onSearch]);

  useEffect(() => {
    setFilteredOptions(filtered);
    setHighlightedIndex(-1);
  }, [filtered]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    // Solo limpia el valor del campo si hay una opción seleccionada previamente
    if (selectedOption) {
      setFieldValue(field.name, '');
      setSelectedOption(null);
    }
    setShowDropdown(true);

    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSelectOption = (option) => {
    // Si se selecciona la opción "Otro", se llama a la función onOtherSelected y se cierra el dropdown
    if (option.isOther) {
      if (onOtherSelected) onOtherSelected();
      setShowDropdown(false);
      setHighlightedIndex(-1);
      return;
    }
    setInputValue(option.label);
    setSelectedOption(option);
    setFieldValue(field.name, option.value);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleClearInput = () => {
    setInputValue('');
    setSelectedOption(null);
    setFieldValue(field.name, '');
    setFieldTouched(field.name, true);
    setHighlightedIndex(-1);
    if (onSearch) onSearch('');
  };

  const handleToggleDropdown = () => {
    const newState = !showDropdown;
    setShowDropdown(newState);
    setHighlightedIndex(-1);
    if (newState && onFocusSearch && onSearch) {
      onSearch(inputValue);
    }
  };

  const handleFocus = () => {
    setShowDropdown(true);
    if (onFocusSearch && onSearch) {
      onSearch(inputValue);
    }
  };

  // Manejador de eventos para navegación por teclado
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showDropdown) {
        setShowDropdown(true);
        if (onSearch && onFocusSearch) onSearch(inputValue);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => {
          const nextIndex = prev + 1 >= filteredOptions.length ? 0 : prev + 1;
          return nextIndex;
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!showDropdown) {
        setShowDropdown(true);
        if (onSearch && onFocusSearch) onSearch(inputValue);
        setHighlightedIndex(filteredOptions.length - 1);
      } else {
        setHighlightedIndex((prev) => {
          const nextIndex =
            prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1;
          return nextIndex;
        });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (
        showDropdown &&
        highlightedIndex >= 0 &&
        highlightedIndex < filteredOptions.length
      ) {
        handleSelectOption(filteredOptions[highlightedIndex]);
      }
    }
  };

  return (
    <div className={classNames('relative', className)}>
      {label && (
        <Label
          htmlFor={field?.name}
          className={classNames('block text-sm font-medium', {
            'text-red-500': touched[field?.name] && errors[field?.name],
          })}
        >
          {label}
        </Label>
      )}
      <div className="relative mt-1">
        {Icon && (
          <div
            className={classNames(
              `absolute text-lg left-3 top-1/2 transform ${!disabled && 'text-neutral-500'} -translate-y-1/2`,
              { 'text-neutral-400': disabled && !inputValue },
              { 'text-red-500': touched[field?.name] && errors[field?.name] },
            )}
          >
            <Icon />
          </div>
        )}
        <input
          {...field}
          type="text"
          className={classNames(
            'w-full text-xs md:text-sm py-2.5 px-3 border rounded-md focus:outline-none focus:ring',
            {
              'border-neutral-500 focus:border-blue-500': !(
                touched[field?.name] && errors[field?.name]
              ),
              'border-red-500 focus:border-red-500 focus:ring-red-500':
                touched[field?.name] && errors[field?.name],
            },
            Icon && 'pl-10',
          )}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onClick={() => setShowDropdown(true)}
          autoComplete="off"
          ref={inputRef}
        />
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
          </div>
        )}
        {isClearable && inputValue && !disabled && (
          <MdClose
            size={18}
            onClick={handleClearInput}
            className="hover:text-red-500 absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer"
          />
        )}
        <MdOutlineKeyboardArrowDown
          size={24}
          className={classNames(
            'absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer',
            { 'rotate-180': showDropdown },
          )}
          onClick={handleToggleDropdown}
        />
      </div>
      {showDropdown && (
        <Dropdown
          options={filteredOptions}
          selectedOption={selectedOption}
          onSelect={handleSelectOption}
          itemsClassName={itemsClassName}
          highlightedIndex={highlightedIndex}
        />
      )}
    </div>
  );
};

export default React.memo(AutocompleteInput);
