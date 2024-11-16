import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ErrorMessage } from 'formik';
import { MdClose, MdOutlineKeyboardArrowDown } from 'react-icons/md';
import classNames from 'classnames';
import { Label } from 'flowbite-react';

const Dropdown = ({ options, onSelect, selectedOption, itemsClassName }) => {
  return (
    <div className="mt-2 pt-1 min-w-full max-h-[44vh] overflow-y-auto border border-gray-300 bg-white rounded-md shadow-lg absolute z-30">
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

// Componente principal con Formik
const AutocompleteInput = ({
  field,
  form: { touched, errors, setFieldValue, setFieldTouched },
  options,
  placeholder = 'Escribe aquí...',
  className,
  label,
  itemsClassName,
  icon: Icon,
  disabled,
  isClearable,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (options.length && field.value) {
      const option = options.find((opt) => opt.value === field.value);
      setSelectedOption(option || null);
      setInputValue(option ? option.label : '');
    }
  }, [field.value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
        setFieldTouched(field.name, true);
        if (!selectedOption && inputValue) {
          setFieldValue(field.name, inputValue);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (options.length && field.value) {
      const option = options.find((opt) => opt.value === field.value);
      setSelectedOption(option || null);
      setInputValue(option ? option.label : '');
    }
  }, [field.value, options]);

  // Normalizar cadenas (remueve acentos)
  const normalizeString = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Filtrar opciones
  const filtered = useMemo(() => {
    return options?.filter((option) =>
      normalizeString(option.label)
        ?.toLowerCase()
        ?.includes(inputValue?.toLowerCase()),
    );
  }, [inputValue, options]);

  useEffect(() => {
    setFilteredOptions(filtered);
  }, [filtered]);

  // Manejadores de eventos
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setFieldValue(field.name, ''); // Limpia el valor seleccionado
    setSelectedOption(null); // Resetea la selección
    setShowDropdown(true);
  };

  const handleSelectOption = (option) => {
    setInputValue(option.label);
    setSelectedOption(option);
    setFieldValue(field.name, option.value);
    // setFieldTouched(field.name, true);
    setShowDropdown(false);
  };

  const handleClearInput = () => {
    setInputValue('');
    setSelectedOption(null);
    setFieldValue(field.name, '');
    setFieldTouched(field.name, true);
  };

  const handleToggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className={classNames('relative', className)}>
      {label && (
        <Label
          htmlFor={field.name}
          className={classNames('block text-sm font-medium', {
            'text-red-500': touched[field.name] && errors[field.name],
          })}
        >
          {label}
        </Label>
      )}
      <div className="relative mt-1">
        {Icon && (
          <div
            className={classNames(
              `absolute text-lg left-3 top-1/2 transform ${
                !disabled && 'text-neutral-500'
              } -translate-y-1/2`,
              { 'text-neutral-400': disabled && !inputValue },
              { 'text-red-500': touched[field.name] && errors[field.name] },
            )}
          >
            <Icon />
          </div>
        )}
        <input
          {...field}
          type="text"
          className={classNames(
            'w-full py-2 px-3 border rounded-md focus:outline-none focus:ring',
            {
              'border-neutral-500 focus:border-blue-500 ': !(
                touched[field.name] && errors[field.name]
              ),
              'border-red-500 focus:border-red-500 focus:ring-red-500':
                touched[field.name] && errors[field.name],
            },
            Icon && 'pl-10',
          )}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          autoComplete="off"
          ref={inputRef}
        />
        {isClearable && inputValue && !disabled && (
          <MdClose
            size={18}
            onClick={handleClearInput}
            className=" hover:text-red-500 absolute right-12 top-1/2 transform -translate-y-1/2 cursor-pointer"
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
        />
      )}
      <ErrorMessage
        name={field.name}
        component="div"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
};

export default React.memo(AutocompleteInput);
