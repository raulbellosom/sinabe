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
            'py-2 px-4 text-sm cursor-pointer flex justify-between items-center border-b border-neutral-200 transition ease-in-out duration-100',
            {
              'bg-blue-500 text-white': selectedOption?.value === option.value,
              'bg-gray-200':
                i === highlightedIndex &&
                selectedOption?.value !== option.value,
              'hover:bg-purple-800 hover:text-white':
                selectedOption?.value !== option.value,
            },
            { [itemsClassName]: itemsClassName },
          )}
        >
          {option.label}
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

  useEffect(() => {
    if (options.length && field.value) {
      const option = options.find((opt) => opt.value === field.value);
      setSelectedOption(option || null);
      setInputValue(option ? option.label : '');
    }
  }, [field.value, options]);

  useEffect(() => {
    if (!field.value) {
      setInputValue('');
      setSelectedOption(null);
    }
  }, [field.value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
        setFieldTouched(field.name, true);
        if (!selectedOption && inputValue) {
          setFieldValue(field.name, inputValue);
        }
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const normalizeString = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Filtrar opciones y agregar la opción "Otro" si corresponde
  const filtered = useMemo(() => {
    const filteredList = options?.filter((option) =>
      normalizeString(option.label)
        .toLowerCase()
        .includes(inputValue.toLowerCase()),
    );

    // Si allowOther es true, se agrega la opción "Otro" al final de la lista
    if (allowOther) {
      filteredList.push({
        label: 'Otro',
        value: 'otro',
        isOther: true, // Propiedad para identificar la opción "Otro"
      });
    }
    return filteredList;
  }, [inputValue, options, allowOther]);

  useEffect(() => {
    setFilteredOptions(filtered);
    setHighlightedIndex(-1);
  }, [filtered]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setFieldValue(field.name, '');
    setSelectedOption(null);
    setShowDropdown(true);
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
  };

  const handleToggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    // Opcional: resetea el índice resaltado cuando se alterna el dropdown
    setHighlightedIndex(-1);
  };

  // Manejador de eventos para navegación por teclado
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showDropdown) {
        setShowDropdown(true);
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
          autoComplete="off"
          ref={inputRef}
        />
        {isClearable && inputValue && !disabled && (
          <MdClose
            size={18}
            onClick={handleClearInput}
            className="hover:text-red-500 absolute right-12 top-1/2 transform -translate-y-1/2 cursor-pointer"
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
      {showDropdown && filteredOptions && (
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
