import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import {
  HiSearch,
  HiX,
  HiChevronDown,
  HiOutlineExternalLink,
} from 'react-icons/hi';
import { MdInventory2, MdFilterList } from 'react-icons/md';
import { searchInventories } from '../../services/api';
import { useCatalogContext } from '../../context/CatalogContext';

/**
 * InventorySearchCombobox - Buscador de inventarios responsivo
 * - Icono de lupa compacto en el navbar
 * - Dropdown responsivo (más grande en desktop, fullscreen en móvil)
 * - Filtros por estado, condición, tipo y marca
 * - Navegación con teclado
 */
const InventorySearchCombobox = ({ className = '' }) => {
  const navigate = useNavigate();
  const {
    inventoryTypes,
    inventoryBrands,
    inventoryConditions,
    fetchInventoryTypes,
    fetchInventoryBrands,
    fetchInventoryConditions,
  } = useCatalogContext();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [portalRoot, setPortalRoot] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

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

  // Cargar catálogos al abrir
  useEffect(() => {
    if (open) {
      if (!inventoryTypes.length) fetchInventoryTypes();
      if (!inventoryBrands.length) fetchInventoryBrands();
      if (!inventoryConditions.length) fetchInventoryConditions();
    }
  }, [open]);

  // Buscar inventarios con debounce
  useEffect(() => {
    if (!open) return;

    // No buscar automáticamente al abrir si no hay término de búsqueda o filtros
    if (
      !search &&
      !filterStatus &&
      !filterCondition &&
      !filterType &&
      !filterBrand
    ) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setLoading(true);
      const params = { searchTerm: search, advancedSearch: false };
      if (filterStatus) params.status = filterStatus;
      if (filterCondition) params.conditionId = filterCondition;
      if (filterType) params.typeId = filterType;
      if (filterBrand) params.brandId = filterBrand;

      searchInventories(params)
        .then((result) => {
          if (result && result.data) {
            setResults(result.data.slice(0, 20));
          } else {
            setResults([]);
          }
        })
        .catch((error) => {
          console.error('Error al buscar inventarios:', error);
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, filterStatus, filterCondition, filterType, filterBrand, open]);

  // Calcular posición del dropdown
  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // En móvil, bottom sheet (no fullscreen)
    if (viewportWidth < 640) {
      setDropdownStyle({
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100%',
        maxHeight: '85vh',
      });
      return;
    }

    // En desktop, alinear al inicio del botón
    const dropdownHeight = 500;
    const spaceBelow = viewportHeight - rect.bottom;
    const showAbove = spaceBelow < dropdownHeight && rect.top > spaceBelow;

    // Ancho del dropdown
    const dropdownWidth = viewportWidth >= 1024 ? 500 : 420;

    // Alinear al lado izquierdo del botón
    let left = rect.left;

    // Asegurar que no se salga del viewport
    if (left + dropdownWidth > viewportWidth - 16) {
      left = viewportWidth - dropdownWidth - 16;
    }
    if (left < 16) left = 16;

    setDropdownStyle({
      position: 'fixed',
      top: showAbove ? 'auto' : rect.bottom + 8,
      bottom: showAbove ? viewportHeight - rect.top + 8 : 'auto',
      left,
      width: dropdownWidth,
      maxWidth: viewportWidth - 32,
    });
  }, []);

  // Actualizar posición cuando se abre
  useLayoutEffect(() => {
    if (open) {
      // Calcular posición inmediatamente antes del render
      updateDropdownPosition();

      // Focus con delay más largo para evitar parpadeo
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 150);

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

  // Bloquear scroll en móvil cuando está abierto
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
    setShowFilters(false);
    setSearch('');
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (!open) {
      setOpen(true);
    } else {
      handleClose();
    }
  };

  const handleSelectResult = (item) => {
    navigate(`/inventories/view/${item.id}`);
    handleClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev + 1 >= results.length ? 0 : prev + 1,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev - 1 < 0 ? results.length - 1 : prev - 1,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelectResult(results[highlightedIndex]);
      } else if (search.trim()) {
        navigate(
          `/inventories?searchTerm=${encodeURIComponent(search.trim())}`,
        );
        handleClose();
      }
    }
  };

  const handleGoToInventories = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('searchTerm', search.trim());
    if (filterStatus) params.set('status', filterStatus);
    if (filterCondition) params.set('conditionId', filterCondition);
    if (filterType) params.set('typeId', filterType);
    if (filterBrand) params.set('brandId', filterBrand);

    const queryString = params.toString();
    navigate(`/inventories${queryString ? `?${queryString}` : ''}`);
    handleClose();
  };

  const activeFiltersCount = [
    filterStatus,
    filterCondition,
    filterType,
    filterBrand,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterStatus('');
    setFilterCondition('');
    setFilterType('');
    setFilterBrand('');
  };

  // Formatear label del inventario
  const formatInventoryLabel = (item) => {
    const parts = [];
    if (item.model?.name) parts.push(item.model.name);
    if (item.model?.brand?.name) parts.push(item.model.brand.name);
    return parts.join(' - ') || `Inventario ${item.id}`;
  };

  const formatInventoryDetails = (item) => {
    const details = [];
    if (item.serialNumber) details.push(`SN: ${item.serialNumber}`);
    if (item.activeNumber) details.push(`#${item.activeNumber}`);
    if (item.model?.type?.name) details.push(item.model.type.name);
    return details.join(' • ');
  };

  // Mapeo de estados a labels y colores
  const statusConfig = {
    ALTA: {
      label: 'Alta',
      bg: 'bg-green-100',
      text: 'text-green-700',
    },
    BAJA: {
      label: 'Baja',
      bg: 'bg-red-100',
      text: 'text-red-700',
    },
    PROPUESTA: {
      label: 'Propuesta',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
    },
  };

  return (
    <div className={classNames('relative', className)} ref={buttonRef}>
      {/* Botón que simula un input de búsqueda */}
      <button
        type="button"
        onClick={handleToggle}
        className={classNames(
          'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 border',
          'min-w-[140px] sm:min-w-[240px]',
          open
            ? 'bg-white border-purple-400 ring-2 ring-purple-200'
            : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-purple-300',
        )}
        aria-label="Buscar inventario"
      >
        <HiSearch className="w-5 h-5 text-gray-400 shrink-0" />
        <span className="text-sm text-gray-500 flex-1 text-left">
          Buscar...
        </span>
      </button>

      {/* Dropdown en portal */}
      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Overlay con blur para móvil */}
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
                    y: isMobile ? '100%' : -10,
                    scale: isMobile ? 1 : 0.95,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: isMobile ? '100%' : -10,
                    scale: isMobile ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  style={{ ...dropdownStyle, willChange: 'transform, opacity' }}
                  className={classNames(
                    'z-[9999] bg-white overflow-hidden flex flex-col',
                    isMobile
                      ? 'rounded-t-2xl shadow-2xl'
                      : 'rounded-2xl border border-gray-200 shadow-xl',
                  )}
                >
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    {/* Título y cerrar en móvil */}
                    {isMobile && (
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Buscar Inventario
                        </h3>
                        <button
                          type="button"
                          onClick={handleClose}
                          className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <HiX className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Input de búsqueda */}
                    <div className="relative">
                      <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar por nombre, serie, activo..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setHighlightedIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        className={classNames(
                          'w-full pl-11 pr-20 py-3 rounded-xl',
                          'bg-gray-50 border-2 border-transparent',
                          'text-gray-900 text-sm placeholder:text-gray-400',
                          'focus:bg-white focus:border-purple-400 focus:outline-none',
                          'transition-all duration-200',
                        )}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {search && (
                          <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowFilters(!showFilters)}
                          className={classNames(
                            'p-2 rounded-lg transition-all duration-200 relative',
                            showFilters || activeFiltersCount > 0
                              ? 'bg-purple-500 text-white shadow-md'
                              : 'text-gray-500 hover:bg-gray-200',
                          )}
                        >
                          <MdFilterList className="w-5 h-5" />
                          {activeFiltersCount > 0 && !showFilters && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                              {activeFiltersCount}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Panel de filtros */}
                    <AnimatePresence>
                      {showFilters && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Filtro de estado */}
                              <div className="relative">
                                <select
                                  value={filterStatus}
                                  onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                  }
                                  className={classNames(
                                    'w-full appearance-none rounded-lg border border-gray-200',
                                    'bg-white pl-3 pr-8 py-2 text-xs sm:text-sm',
                                    'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
                                    'cursor-pointer transition-all',
                                    filterStatus
                                      ? 'text-gray-900 font-medium'
                                      : 'text-gray-500',
                                  )}
                                >
                                  <option value="">Estado</option>
                                  <option value="ALTA">Alta</option>
                                  <option value="BAJA">Baja</option>
                                  <option value="PROPUESTA">Propuesta</option>
                                </select>
                                <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>

                              {/* Filtro de condición */}
                              <div className="relative">
                                <select
                                  value={filterCondition}
                                  onChange={(e) =>
                                    setFilterCondition(e.target.value)
                                  }
                                  className={classNames(
                                    'w-full appearance-none rounded-lg border border-gray-200',
                                    'bg-white pl-3 pr-8 py-2 text-xs sm:text-sm',
                                    'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
                                    'cursor-pointer transition-all',
                                    filterCondition
                                      ? 'text-gray-900 font-medium'
                                      : 'text-gray-500',
                                  )}
                                >
                                  <option value="">Condición</option>
                                  {inventoryConditions.map((cond) => (
                                    <option key={cond.id} value={cond.id}>
                                      {cond.name}
                                    </option>
                                  ))}
                                </select>
                                <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>

                              {/* Filtro de tipo */}
                              <div className="relative">
                                <select
                                  value={filterType}
                                  onChange={(e) =>
                                    setFilterType(e.target.value)
                                  }
                                  className={classNames(
                                    'w-full appearance-none rounded-lg border border-gray-200',
                                    'bg-white pl-3 pr-8 py-2 text-xs sm:text-sm',
                                    'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
                                    'cursor-pointer transition-all',
                                    filterType
                                      ? 'text-gray-900 font-medium'
                                      : 'text-gray-500',
                                  )}
                                >
                                  <option value="">Tipo</option>
                                  {inventoryTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                      {type.name}
                                    </option>
                                  ))}
                                </select>
                                <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>

                              {/* Filtro de marca */}
                              <div className="relative">
                                <select
                                  value={filterBrand}
                                  onChange={(e) =>
                                    setFilterBrand(e.target.value)
                                  }
                                  className={classNames(
                                    'w-full appearance-none rounded-lg border border-gray-200',
                                    'bg-white pl-3 pr-8 py-2 text-xs sm:text-sm',
                                    'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent',
                                    'cursor-pointer transition-all',
                                    filterBrand
                                      ? 'text-gray-900 font-medium'
                                      : 'text-gray-500',
                                  )}
                                >
                                  <option value="">Marca</option>
                                  {inventoryBrands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>
                                      {brand.name}
                                    </option>
                                  ))}
                                </select>
                                <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {activeFiltersCount > 0 && (
                              <button
                                type="button"
                                onClick={clearFilters}
                                className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium"
                              >
                                <HiX className="w-3.5 h-3.5" />
                                Limpiar {activeFiltersCount} filtro
                                {activeFiltersCount > 1 ? 's' : ''}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Lista de resultados */}
                  <div
                    className={classNames(
                      'overflow-y-auto flex-1',
                      isMobile ? 'max-h-[60vh]' : 'max-h-80',
                    )}
                  >
                    {loading ? (
                      <div className="py-12 text-center">
                        <div className="inline-block w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Buscando...</p>
                      </div>
                    ) : results.length === 0 ? (
                      <div className="py-12 text-center px-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <MdInventory2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {search || activeFiltersCount > 0
                            ? 'Sin resultados'
                            : 'Busca inventarios'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {search || activeFiltersCount > 0
                            ? 'Intenta con otros términos o filtros'
                            : 'Escribe un nombre, serie o número de activo'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {results.map((item, index) => {
                          const status = statusConfig[item.status];
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectResult(item)}
                              className={classNames(
                                'w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150',
                                highlightedIndex === index
                                  ? 'bg-purple-50 ring-2 ring-purple-200'
                                  : 'hover:bg-gray-50',
                              )}
                            >
                              {/* Icono */}
                              <div
                                className={classNames(
                                  'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
                                  status?.bg || 'bg-purple-100',
                                )}
                              >
                                <MdInventory2
                                  className={classNames(
                                    'w-5 h-5',
                                    status?.text || 'text-purple-600',
                                  )}
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {formatInventoryLabel(item)}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {formatInventoryDetails(item)}
                                </p>
                              </div>

                              {/* Badge de estado */}
                              {status && (
                                <span
                                  className={classNames(
                                    'px-2 py-1 rounded-lg text-[11px] font-semibold shrink-0',
                                    status.bg,
                                    status.text,
                                  )}
                                >
                                  {status.label}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {results.length > 0 ? (
                          <>
                            <span className="font-semibold text-gray-700">
                              {results.length}
                            </span>{' '}
                            resultado{results.length !== 1 ? 's' : ''}
                          </>
                        ) : (
                          'Busca en tu inventario'
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={handleGoToInventories}
                        className={classNames(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                          'bg-purple-600 text-white hover:bg-purple-700',
                          'transition-colors duration-200',
                        )}
                      >
                        Ver todos
                        <HiOutlineExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          portalRoot,
        )}
    </div>
  );
};

export default InventorySearchCombobox;
