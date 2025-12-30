import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { HiSearch, HiX, HiChevronDown, HiCheck } from 'react-icons/hi';

/**
 * SearchableSelect - Componente de selección con búsqueda
 *
 * Props:
 * - options: Array de opciones [{ value: string, label: string, description?: string, icon?: ReactNode }]
 * - value: Valor seleccionado (string para single, array para multiple)
 * - onChange: Callback (value) => void
 * - multiple: boolean - permitir múltiples selecciones
 * - placeholder: string
 * - searchPlaceholder: string
 * - label: string - etiqueta del campo
 * - disabled: boolean
 * - error: string - mensaje de error
 * - className: string
 * - maxHeight: number - altura máxima del dropdown
 * - renderOption: (option) => ReactNode - render personalizado de opciones
 * - filterFn: (option, searchTerm) => boolean - función de filtrado personalizada
 * - emptyMessage: string - mensaje cuando no hay resultados
 * - showSelectAll: boolean - mostrar opción "Seleccionar todos" en modo múltiple
 */
const SearchableSelect = ({
  options = [],
  value,
  onChange,
  multiple = false,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  label,
  disabled = false,
  error,
  className = '',
  maxHeight = 300,
  renderOption,
  filterFn,
  emptyMessage = 'No se encontraron resultados',
  showSelectAll = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [portalRoot, setPortalRoot] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Establecer portal root después del mount
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // Filtrar opciones según búsqueda
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;

    const searchLower = search.toLowerCase().trim();

    if (filterFn) {
      return options.filter((opt) => filterFn(opt, searchLower));
    }

    return options.filter((opt) => {
      const labelMatch = opt.label?.toLowerCase().includes(searchLower);
      const valueMatch = opt.value
        ?.toString()
        .toLowerCase()
        .includes(searchLower);
      const descMatch = opt.description?.toLowerCase().includes(searchLower);
      return labelMatch || valueMatch || descMatch;
    });
  }, [options, search, filterFn]);

  // Calcular valores seleccionados para mostrar
  const selectedLabels = useMemo(() => {
    if (multiple) {
      const vals = Array.isArray(value) ? value : [];
      return vals
        .map((v) => options.find((o) => o.value === v)?.label || v)
        .filter(Boolean);
    }
    return options.find((o) => o.value === value)?.label || '';
  }, [value, options, multiple]);

  // Calcular posición del dropdown
  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // En móvil, bottom sheet
    if (viewportWidth < 640) {
      setDropdownStyle({
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100%',
        maxHeight: '70vh',
      });
      return;
    }

    // En desktop
    const dropdownHeight = Math.min(maxHeight + 100, 400);
    const spaceBelow = viewportHeight - rect.bottom;
    const showAbove = spaceBelow < dropdownHeight && rect.top > spaceBelow;

    const dropdownWidth = Math.max(rect.width, 250);
    let left = rect.left;

    if (left + dropdownWidth > viewportWidth - 16) {
      left = viewportWidth - dropdownWidth - 16;
    }
    if (left < 16) left = 16;

    setDropdownStyle({
      position: 'fixed',
      top: showAbove ? 'auto' : rect.bottom + 4,
      bottom: showAbove ? viewportHeight - rect.top + 4 : 'auto',
      left,
      width: dropdownWidth,
      maxWidth: viewportWidth - 32,
    });
  }, [maxHeight]);

  // Actualizar posición cuando se abre
  useLayoutEffect(() => {
    if (open) {
      updateDropdownPosition();
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 100);

      const handleUpdate = () => updateDropdownPosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
        clearTimeout(focusTimer);
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [open, updateDropdownPosition]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  // Bloquear scroll en móvil
  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open, isMobile]);

  const handleClose = () => {
    setOpen(false);
    setSearch('');
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!open) {
      setOpen(true);
    } else {
      handleClose();
    }
  };

  const handleSelect = (optionValue) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(optionValue)) {
        onChange(current.filter((v) => v !== optionValue));
      } else {
        onChange([...current, optionValue]);
      }
    } else {
      onChange(optionValue);
      handleClose();
    }
  };

  const handleSelectAll = () => {
    if (!multiple) return;
    const allValues = filteredOptions.map((o) => o.value);
    const current = Array.isArray(value) ? value : [];
    const allSelected = allValues.every((v) => current.includes(v));

    if (allSelected) {
      onChange(current.filter((v) => !allValues.includes(v)));
    } else {
      const newValues = [...new Set([...current, ...allValues])];
      onChange(newValues);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev + 1 >= filteredOptions.length ? 0 : prev + 1,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== '' && value !== null && value !== undefined;

  return (
    <div className={classNames('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      {/* Botón trigger */}
      <div
        ref={buttonRef}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={classNames(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 border text-left cursor-pointer',
          'min-h-[42px]',
          disabled
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400'
            : open
              ? 'bg-white border-blue-400 ring-2 ring-blue-100 dark:bg-gray-800 dark:border-blue-500'
              : 'bg-white border-gray-300 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600',
          error && 'border-red-500 ring-2 ring-red-100',
        )}
      >
        <div className="flex-1 min-w-0">
          {hasValue ? (
            multiple ? (
              <div className="flex flex-wrap gap-1">
                {selectedLabels.slice(0, 3).map((lbl, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {lbl}
                  </span>
                ))}
                {selectedLabels.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    +{selectedLabels.length - 3} más
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-900 dark:text-white truncate block">
                {selectedLabels}
              </span>
            )
          ) : (
            <span className="text-sm text-gray-500">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2 shrink-0">
          {hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
          <HiChevronDown
            className={classNames(
              'w-5 h-5 text-gray-400 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Dropdown en portal */}
      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Overlay móvil */}
                {isMobile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
                    onClick={handleClose}
                  />
                )}

                <motion.div
                  ref={dropdownRef}
                  initial={{
                    opacity: 0,
                    y: isMobile ? '100%' : -8,
                    scale: isMobile ? 1 : 0.95,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: isMobile ? '100%' : -8,
                    scale: isMobile ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{ ...dropdownStyle, willChange: 'transform, opacity' }}
                  className={classNames(
                    'z-[9999] bg-white dark:bg-gray-800 overflow-hidden flex flex-col',
                    isMobile
                      ? 'rounded-t-2xl shadow-2xl'
                      : 'rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg',
                  )}
                >
                  {/* Header con búsqueda */}
                  <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                    {isMobile && (
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                          {label || placeholder}
                        </h3>
                        <button
                          type="button"
                          onClick={handleClose}
                          className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <HiX className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    <div className="relative">
                      <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setHighlightedIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        className={classNames(
                          'w-full pl-9 pr-3 py-2 rounded-lg',
                          'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600',
                          'text-sm text-gray-900 dark:text-white placeholder:text-gray-400',
                          'focus:bg-white dark:focus:bg-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100',
                          'transition-all duration-200',
                        )}
                      />
                    </div>

                    {/* Seleccionar todos */}
                    {multiple &&
                      showSelectAll &&
                      filteredOptions.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                        >
                          {Array.isArray(value) &&
                          filteredOptions.every((o) => value.includes(o.value))
                            ? 'Deseleccionar todos'
                            : 'Seleccionar todos'}
                        </button>
                      )}
                  </div>

                  {/* Lista de opciones */}
                  <div
                    className="overflow-y-auto flex-1"
                    style={{ maxHeight: isMobile ? '50vh' : maxHeight }}
                  >
                    {filteredOptions.length === 0 ? (
                      <div className="py-8 text-center px-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {emptyMessage}
                        </p>
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredOptions.map((option, index) => {
                          const selected = isSelected(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleSelect(option.value)}
                              className={classNames(
                                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150',
                                highlightedIndex === index
                                  ? 'bg-blue-50 dark:bg-blue-900/30'
                                  : selected
                                    ? 'bg-blue-50/50 dark:bg-blue-900/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                              )}
                            >
                              {/* Checkbox para multiple */}
                              {multiple && (
                                <div
                                  className={classNames(
                                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                                    selected
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-gray-300 dark:border-gray-500',
                                  )}
                                >
                                  {selected && (
                                    <HiCheck className="w-3.5 h-3.5 text-white" />
                                  )}
                                </div>
                              )}

                              {/* Icono opcional */}
                              {option.icon && (
                                <div className="shrink-0">{option.icon}</div>
                              )}

                              {/* Contenido */}
                              <div className="flex-1 min-w-0">
                                {renderOption ? (
                                  renderOption(option)
                                ) : (
                                  <>
                                    <p
                                      className={classNames(
                                        'text-sm truncate',
                                        selected
                                          ? 'font-medium text-blue-700 dark:text-blue-300'
                                          : 'text-gray-900 dark:text-white',
                                      )}
                                    >
                                      {option.label}
                                    </p>
                                    {option.description && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {option.description}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Check para single */}
                              {!multiple && selected && (
                                <HiCheck className="w-5 h-5 text-blue-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer móvil */}
                  {isMobile && multiple && (
                    <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Aplicar ({Array.isArray(value) ? value.length : 0}{' '}
                        seleccionados)
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          portalRoot,
        )}
    </div>
  );
};

export default SearchableSelect;
