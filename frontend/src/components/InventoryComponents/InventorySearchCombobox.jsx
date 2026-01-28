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
 * InventorySearchCombobox - Buscador de inventarios unificado
 * - Input real en el navbar (no un botón falso)
 * - Dropdown anexado visualmente al input en Desktop
 * - Fullscreen en móvil para mejor usabilidad
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
  const [isMobile, setIsMobile] = useState(false);
  const [portalRoot, setPortalRoot] = useState(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Focus mobile input on open
  useEffect(() => {
    if (open && isMobile) {
      // Small timeout to allow animation/portal to mount
      const timer = setTimeout(() => {
        if (mobileInputRef.current) {
          mobileInputRef.current.focus();
        }
      }, 300); // 300ms to match transition roughly
      return () => clearTimeout(timer);
    }
  }, [open, isMobile]);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // MD breakpoint usually
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // Si no está abierto y no hay búsqueda, no hacer nada
    if (!open && !search) return;

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
            setResults(result.data.slice(0, 20)); // Limitar resultados locales
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

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        // En desktop cerramos si clic fuera
        if (!isMobile) handleClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, isMobile]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        handleClose();
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setShowFilters(false);
    setHighlightedIndex(-1);
    // No limpiamos search para que persista si el usuario solo cerró el dropdown
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleSelectResult = (item) => {
    navigate(`/inventories/view/${item.id}`);
    handleClose();
    setSearch('');
  };

  const handleKeyDown = (e) => {
    // Si no está abierto, abrirlo al escribir (excepto teclas de control)
    if (!open && e.key.length === 1) {
      setOpen(true);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
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
        const params = new URLSearchParams();
        params.set('searchTerm', search.trim());
        navigate(`/inventories?${params.toString()}`);
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

    navigate(`/inventories?${params.toString()}`);
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

  // Render Helpers
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

  const statusConfig = {
    ALTA: { label: 'Alta', bg: 'bg-green-100', text: 'text-green-700' },
    BAJA: { label: 'Baja', bg: 'bg-red-100', text: 'text-red-700' },
    PROPUESTA: {
      label: 'Propuesta',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
    },
  };

  // Contenido del Dropdown (Filtros + Resultados)
  const renderDropdownContent = () => (
    <div className="flex flex-col h-full max-h-full">
      {/* Search Input for Mobile Header ONLY */}
      {isMobile && (
        <div className="p-4 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Buscar</h3>
            <button
              onClick={handleClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={mobileInputRef}
              autoFocus
              type="text"
              placeholder="Buscar por nombre, serie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>
      )}

      {/* Panel de filtros */}
      <AnimatePresence>
        {(showFilters || (isMobile && activeFiltersCount > 0)) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 overflow-hidden bg-white border-b border-gray-100"
          >
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {/* Filtro Status */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-xs focus:ring-purple-400 cursor-pointer"
                  >
                    <option value="">Estado</option>
                    <option value="ALTA">Alta</option>
                    <option value="BAJA">Baja</option>
                    <option value="PROPUESTA">Propuesta</option>
                  </select>
                  <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {/* Filtro Condición */}
                <div className="relative">
                  <select
                    value={filterCondition}
                    onChange={(e) => setFilterCondition(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-xs focus:ring-purple-400 cursor-pointer"
                  >
                    <option value="">Condición</option>
                    {inventoryConditions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {/* Filtro Tipo */}
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-xs focus:ring-purple-400 cursor-pointer"
                  >
                    <option value="">Tipo</option>
                    {inventoryTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {/* Filtro Marca */}
                <div className="relative">
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 py-2 text-xs focus:ring-purple-400 cursor-pointer"
                  >
                    <option value="">Marca</option>
                    {inventoryBrands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-purple-600 font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Resultados */}
      <div className="overflow-y-auto flex-1 p-2">
        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-2" />
            <p className="text-xs text-gray-500">Buscando...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <MdInventory2 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {search || activeFiltersCount > 0
                ? 'Sin resultados'
                : 'Busca inventarios'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {search || activeFiltersCount > 0
                ? 'Intenta otros términos'
                : 'Escribe nombre, serie o activo'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {results.map((item, index) => {
              const status = statusConfig[item.status];
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  className={classNames(
                    'w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                    highlightedIndex === index
                      ? 'bg-purple-50 ring-1 ring-purple-200'
                      : 'hover:bg-gray-50',
                  )}
                >
                  <div
                    className={classNames(
                      'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                      status?.bg || 'bg-purple-100',
                    )}
                  >
                    <MdInventory2
                      className={classNames(
                        'w-4 h-4',
                        status?.text || 'text-purple-600',
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {formatInventoryLabel(item)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {formatInventoryDetails(item)}
                    </p>
                  </div>
                  {status && (
                    <span
                      className={classNames(
                        'px-2 py-0.5 rounded text-[10px] font-semibold',
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
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-right">
        <button
          onClick={handleGoToInventories}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Ver todos los resultados
          <HiOutlineExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={classNames('relative transition-all duration-200', className)}
    >
      {/* 
         Unified Input Container (Desktop) OR Icon Trigger (Mobile)
      */}
      {isMobile ? (
        <button
          onClick={handleOpen}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Buscar"
        >
          <HiSearch className="w-6 h-6" />
        </button>
      ) : (
        <div
          className={classNames(
            'relative flex items-center bg-gray-50 border border-gray-200 transition-all duration-200',
            // Desktop styles mainly
            'min-w-[140px] sm:min-w-[600px] h-11', // Increased width to 600px
            open
              ? 'rounded-t-2xl rounded-b-none border-transparent bg-white shadow-lg z-[60]' // Removed purple border, added shadow
              : 'rounded-2xl hover:border-gray-300 hover:bg-white hover:shadow-sm z-50',
          )}
        >
          <HiSearch className="absolute left-3.5 w-5 h-5 text-gray-400 pointer-events-none" />

          {/* The actual input - always visible on Desktop */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={handleOpen}
            onKeyDown={handleKeyDown}
            className={classNames(
              'w-full pl-10 pr-10 bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-500 h-full',
            )}
          />

          {/* Right Actions: Clear / Filter */}
          <div className="absolute right-2 flex items-center gap-1">
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
              >
                <HiX className="w-4 h-4" />
              </button>
            )}
            {/* Filter Trigger (Desktop) */}
            <button
              onClick={() => {
                if (!open) setOpen(true);
                setShowFilters(!showFilters);
              }}
              className={classNames(
                'p-1.5 rounded-lg transition-colors',
                showFilters
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
              )}
            >
              <MdFilterList className="w-5 h-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 
        DESKTOP DROPDOWN: Attached physically to the input
      */}
      {!isMobile && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.1 }}
              className={classNames(
                'absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-2xl z-[59]', // Removed borders, relying on shadow
                '-mt-[1px]', // Overlap slight border
              )}
              style={{ minHeight: '100px', maxHeight: '500px' }}
            >
              {renderDropdownContent()}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* 
        MOBILE DROPDOWN: Portal Fullscreen 
        We still use a portal for mobile because "unified" is hard on small screens with keyboard.
      */}
      {/* 
        MOBILE DROPDOWN: Portal "Bottom Sheet" Modal 
        - Fixed height (75dvh) to cover 3/4 of screen reliably.
        - Attached to bottom.
      */}
      {isMobile &&
        portalRoot &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* Backdrop Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                  onClick={handleClose}
                />

                {/* Modal Content */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 h-[75dvh] z-[9999] bg-white rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
                  // Ensure we don't accidentally close when clicking inside
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderDropdownContent()}
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
