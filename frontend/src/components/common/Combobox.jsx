import {
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
import { Search, X, ChevronDown, Check, Plus } from 'lucide-react';

/**
 * Combobox - Componente unificado de selección
 *
 * Soporta:
 * - Búsqueda local y asíncrona
 * - Selección simple y múltiple
 * - Crear nuevas opciones (creatable)
 * - Custom rendering de opciones
 * - Tematización con variables CSS del proyecto
 *
 * Props principales:
 * - options: Array de opciones [{ value, label, description?, icon?, ...custom }]
 * - value: Valor(es) seleccionado(s) - objeto {value, label} o array de ellos
 * - onChange: Callback (selectedOption) => void
 * - loadOptions: (inputValue) => Promise<options[]> - para modo async
 * - isMulti: boolean - múltiples selecciones
 * - isCreatable: boolean - permitir crear nuevas opciones
 * - onCreateOption: (inputValue) => Promise<option> | option
 * - placeholder, label, disabled, error, className
 * - cacheOptions: boolean - cachear resultados de loadOptions
 * - defaultOptions: boolean | options[] - cargar al abrir
 * - closeMenuOnSelect: boolean
 * - isClearable: boolean
 * - components: { Option?, SingleValue?, MultiValue? }
 * - formatCreateLabel: (inputValue) => string
 * - getOptionValue: (option) => value
 * - getOptionLabel: (option) => label
 */
const Combobox = ({
  options: staticOptions = [],
  value,
  onChange,
  loadOptions,
  isMulti = false,
  isCreatable = false,
  onCreateOption,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  label,
  disabled = false,
  error,
  className = '',
  maxHeight = 280,
  cacheOptions = true,
  defaultOptions = true,
  closeMenuOnSelect = true,
  isClearable = true,
  components = {},
  formatCreateLabel = (inputValue) => `Crear "${inputValue}"`,
  getOptionValue = (opt) => opt?.value,
  getOptionLabel = (opt) => opt?.label,
  filterOption,
  emptyMessage = 'No se encontraron resultados',
  loadingMessage = 'Cargando...',
  styles = {},
  name,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [portalRoot, setPortalRoot] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Estado para modo async
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [optionsCache, setOptionsCache] = useState({});

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const isAsync = typeof loadOptions === 'function';

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Portal root
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // Cargar opciones por defecto cuando se abre (modo async)
  useEffect(() => {
    if (
      open &&
      isAsync &&
      defaultOptions === true &&
      asyncOptions.length === 0 &&
      !isLoading
    ) {
      loadAsyncOptions('');
    }
  }, [open, isAsync, defaultOptions]);

  // Función para cargar opciones async
  const loadAsyncOptions = useCallback(
    async (inputValue) => {
      if (!isAsync) return;

      // Verificar cache
      if (cacheOptions && optionsCache[inputValue]) {
        setAsyncOptions(optionsCache[inputValue]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await loadOptions(inputValue);
        const opts = results || [];
        setAsyncOptions(opts);

        if (cacheOptions) {
          setOptionsCache((prev) => ({ ...prev, [inputValue]: opts }));
        }
      } catch (err) {
        console.error('Error loading options:', err);
        setAsyncOptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isAsync, loadOptions, cacheOptions, optionsCache],
  );

  // Debounce para búsqueda async
  useEffect(() => {
    if (!isAsync || !open) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      loadAsyncOptions(search);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, isAsync, open, loadAsyncOptions]);

  // Opciones actuales (estáticas o async)
  const currentOptions = useMemo(() => {
    if (isAsync) {
      // Si defaultOptions es un array, usarlo como opciones iniciales
      if (Array.isArray(defaultOptions) && asyncOptions.length === 0) {
        return defaultOptions;
      }
      return asyncOptions;
    }
    return staticOptions;
  }, [isAsync, asyncOptions, staticOptions, defaultOptions]);

  // Filtrar opciones (solo para modo estático)
  const filteredOptions = useMemo(() => {
    if (isAsync) return currentOptions; // El filtrado lo hace el servidor

    if (!search.trim()) return currentOptions;

    const searchLower = search.toLowerCase().trim();

    if (filterOption) {
      return currentOptions.filter((opt) => filterOption(opt, searchLower));
    }

    return currentOptions.filter((opt) => {
      const labelMatch = getOptionLabel(opt)
        ?.toLowerCase()
        .includes(searchLower);
      const valueMatch = String(getOptionValue(opt))
        .toLowerCase()
        .includes(searchLower);
      return labelMatch || valueMatch;
    });
  }, [
    currentOptions,
    search,
    isAsync,
    filterOption,
    getOptionLabel,
    getOptionValue,
  ]);

  // Calcular si debemos mostrar opción de crear
  const showCreateOption = useMemo(() => {
    if (!isCreatable || !search.trim()) return false;

    const searchLower = search.toLowerCase().trim();
    const exactMatch = filteredOptions.some(
      (opt) => getOptionLabel(opt)?.toLowerCase() === searchLower,
    );
    return !exactMatch;
  }, [isCreatable, search, filteredOptions, getOptionLabel]);

  // Obtener labels seleccionados
  const getSelectedDisplay = useCallback(() => {
    if (!value) return null;

    if (isMulti) {
      const values = Array.isArray(value) ? value : [];
      return values
        .map((v) => getOptionLabel(v) || getOptionValue(v))
        .filter(Boolean);
    }

    return getOptionLabel(value) || getOptionValue(value);
  }, [value, isMulti, getOptionLabel, getOptionValue]);

  const selectedDisplay = getSelectedDisplay();
  const hasValue = isMulti
    ? Array.isArray(value) && value.length > 0
    : value !== null && value !== undefined;

  // Calcular posición del dropdown
  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

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

  // Cerrar al clic fuera
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
      if (e.key === 'Escape' && open) handleClose();
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

  const handleSelect = (option) => {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      const optValue = getOptionValue(option);
      const exists = current.some((v) => getOptionValue(v) === optValue);

      if (exists) {
        onChange(current.filter((v) => getOptionValue(v) !== optValue));
      } else {
        onChange([...current, option]);
      }

      if (closeMenuOnSelect) handleClose();
    } else {
      onChange(option);
      handleClose();
    }
  };

  const handleCreate = async () => {
    if (!search.trim() || !isCreatable) return;

    const newOption = { value: search, label: search, __isNew__: true };

    if (onCreateOption) {
      try {
        const created = await onCreateOption(search);
        if (created) {
          handleSelect(created);
        } else {
          handleSelect(newOption);
        }
      } catch (err) {
        console.error('Error creating option:', err);
        handleSelect(newOption);
      }
    } else {
      handleSelect(newOption);
    }

    setSearch('');
  };

  const handleRemoveValue = (optionToRemove, e) => {
    e?.stopPropagation();
    if (!isMulti) {
      onChange(null);
      return;
    }

    const current = Array.isArray(value) ? value : [];
    onChange(
      current.filter(
        (v) => getOptionValue(v) !== getOptionValue(optionToRemove),
      ),
    );
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(isMulti ? [] : null);
  };

  const handleKeyDown = (e) => {
    const totalOptions = filteredOptions.length + (showCreateOption ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 >= totalOptions ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev - 1 < 0 ? totalOptions - 1 : prev - 1,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex === filteredOptions.length && showCreateOption) {
        handleCreate();
      } else if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredOptions.length
      ) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    }
  };

  const isSelected = (option) => {
    if (!value) return false;
    const optValue = getOptionValue(option);

    if (isMulti) {
      return (
        Array.isArray(value) &&
        value.some((v) => getOptionValue(v) === optValue)
      );
    }
    return getOptionValue(value) === optValue;
  };

  // Renderizar opción personalizada o default
  const renderOptionContent = (option) => {
    if (components.Option) {
      return (
        <components.Option
          data={option}
          innerRef={null}
          innerProps={{}}
          isSelected={isSelected(option)}
        />
      );
    }

    return (
      <>
        {option.icon && <div className="shrink-0">{option.icon}</div>}
        <div className="flex-1 min-w-0">
          <p
            className={classNames(
              'text-sm truncate',
              isSelected(option)
                ? 'font-medium text-[var(--primary)]'
                : 'text-[var(--foreground)]',
            )}
          >
            {getOptionLabel(option)}
          </p>
          {option.description && (
            <p className="text-xs text-[var(--foreground-muted)] truncate mt-0.5">
              {option.description}
            </p>
          )}
        </div>
      </>
    );
  };

  // Renderizar valor seleccionado
  const renderSelectedValue = () => {
    if (!hasValue) {
      return (
        <span className="text-sm text-[var(--foreground-muted)]">
          {placeholder}
        </span>
      );
    }

    if (isMulti) {
      const values = Array.isArray(value) ? value : [];
      const displayCount = 3;

      if (components.MultiValue) {
        return (
          <div className="flex flex-wrap gap-1">
            {values.slice(0, displayCount).map((v, idx) => (
              <components.MultiValue
                key={idx}
                data={v}
                removeProps={{ onClick: (e) => handleRemoveValue(v, e) }}
              />
            ))}
            {values.length > displayCount && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--surface-muted)] text-[var(--foreground-muted)]">
                +{values.length - displayCount} más
              </span>
            )}
          </div>
        );
      }

      return (
        <div className="flex flex-wrap gap-1">
          {values.slice(0, displayCount).map((v, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]"
            >
              {getOptionLabel(v)}
              <button
                type="button"
                onClick={(e) => handleRemoveValue(v, e)}
                className="hover:text-[var(--danger)] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {values.length > displayCount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--surface-muted)] text-[var(--foreground-muted)]">
              +{values.length - displayCount} más
            </span>
          )}
        </div>
      );
    }

    if (components.SingleValue) {
      return <components.SingleValue data={value} />;
    }

    return (
      <span className="text-sm text-[var(--foreground)] truncate block">
        {selectedDisplay}
      </span>
    );
  };

  return (
    <div className={classNames('relative', className)}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-[var(--foreground)] mb-1"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
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
            ? 'bg-[var(--surface-muted)] border-[var(--border)] cursor-not-allowed opacity-60'
            : open
              ? 'bg-[var(--surface)] border-[var(--primary)] ring-2 ring-[var(--primary)]/20'
              : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--primary)]/50',
          error && 'border-[var(--danger)] ring-2 ring-[var(--danger)]/20',
          styles.control?.className,
        )}
        style={styles.control?.style}
      >
        <div className="flex-1 min-w-0">{renderSelectedValue()}</div>

        <div className="flex items-center gap-1 ml-2 shrink-0">
          {hasValue && isClearable && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded hover:bg-[var(--surface-muted)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown
            className={classNames(
              'w-5 h-5 text-[var(--foreground-muted)] transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>}

      {/* Dropdown Portal */}
      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Mobile Overlay */}
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
                    'z-[9999] bg-[var(--surface)] overflow-hidden flex flex-col',
                    isMobile
                      ? 'rounded-t-2xl shadow-2xl'
                      : 'rounded-xl border border-[var(--border)] shadow-lg',
                  )}
                >
                  {/* Header con búsqueda */}
                  <div className="p-3 border-b border-[var(--border)]">
                    {isMobile && (
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-semibold text-[var(--foreground)]">
                          {label || placeholder}
                        </h3>
                        <button
                          type="button"
                          onClick={handleClose}
                          className="p-2 -mr-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--surface-muted)]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)] pointer-events-none" />
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
                          'bg-[var(--surface-muted)] border border-[var(--border)]',
                          'text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]',
                          'focus:bg-[var(--surface)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20',
                          'transition-all duration-200',
                        )}
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div
                    className="overflow-y-auto flex-1 custom-scrollbar"
                    style={{ maxHeight: isMobile ? '50vh' : maxHeight }}
                  >
                    {isLoading ? (
                      <div className="py-8 text-center px-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[var(--primary)] border-t-transparent" />
                        <p className="text-sm text-[var(--foreground-muted)] mt-2">
                          {loadingMessage}
                        </p>
                      </div>
                    ) : filteredOptions.length === 0 && !showCreateOption ? (
                      <div className="py-8 text-center px-4">
                        <p className="text-sm text-[var(--foreground-muted)]">
                          {emptyMessage}
                        </p>
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredOptions.map((option, index) => {
                          const selected = isSelected(option);
                          return (
                            <button
                              key={getOptionValue(option) || index}
                              type="button"
                              onClick={() => handleSelect(option)}
                              className={classNames(
                                'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150',
                                highlightedIndex === index
                                  ? 'bg-[var(--primary)]/10'
                                  : selected
                                    ? 'bg-[var(--primary)]/5'
                                    : 'hover:bg-[var(--surface-muted)]',
                              )}
                            >
                              {/* Checkbox for multi */}
                              {isMulti && (
                                <div
                                  className={classNames(
                                    'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                                    selected
                                      ? 'bg-[var(--primary)] border-[var(--primary)]'
                                      : 'border-[var(--border)]',
                                  )}
                                >
                                  {selected && (
                                    <Check className="w-3.5 h-3.5 text-[var(--primary-foreground)]" />
                                  )}
                                </div>
                              )}

                              {renderOptionContent(option)}

                              {/* Check for single */}
                              {!isMulti && selected && (
                                <Check className="w-5 h-5 text-[var(--primary)] shrink-0" />
                              )}
                            </button>
                          );
                        })}

                        {/* Create Option */}
                        {showCreateOption && (
                          <button
                            type="button"
                            onClick={handleCreate}
                            className={classNames(
                              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150',
                              highlightedIndex === filteredOptions.length
                                ? 'bg-[var(--primary)]/10'
                                : 'hover:bg-[var(--surface-muted)]',
                            )}
                          >
                            <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                              <Plus className="w-3.5 h-3.5 text-[var(--primary)]" />
                            </div>
                            <span className="text-sm text-[var(--primary)] font-medium">
                              {formatCreateLabel(search)}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mobile footer */}
                  {isMobile && isMulti && (
                    <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-muted)]">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full py-2.5 px-4 rounded-lg text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
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

export default Combobox;
