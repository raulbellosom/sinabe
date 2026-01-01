import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Badge, Spinner, Tooltip } from 'flowbite-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import {
  HiSearch,
  HiX,
  HiExternalLink,
  HiSparkles,
  HiLightBulb,
  HiChartBar,
  HiCollection,
  HiExclamationCircle,
  HiRefresh,
  HiArrowRight,
  HiChevronLeft,
  HiChevronRight,
  HiDatabase,
  HiLocationMarker,
  HiTag,
  HiOfficeBuilding,
  HiDocumentText,
  HiCube,
  HiChartPie,
  HiDownload,
  HiClipboard,
  HiClipboardCheck,
} from 'react-icons/hi';
import { useAIAgent } from '../../context/AIAgentContext.jsx';
import { aiService } from '../../services/ai.api';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

// ============================================
// Animation Variants
// ============================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

const pulseGlow = {
  initial: { boxShadow: '0 0 0 0 rgba(147, 51, 234, 0)' },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(147, 51, 234, 0.4)',
      '0 0 0 20px rgba(147, 51, 234, 0)',
    ],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

// ============================================
// Helper: Build filter URL for navigation
// Maps AI filter keys to the backend searchInventories query params
// Backend supports arrays via repeated params: brandName=HP&brandName=Avigilon
//
// IMPORTANT: When clicking on a grouped item (e.g., a model from a chart),
// the groupKey/groupValue should be the PRIMARY filter. We don't include
// broader filters that would be redundant or confusing.
// Example: If user searched "modelos de HP y Avigilon" and clicks on model "V193",
// the URL should be /inventories?modelName=V193 (not including both brands)
// ============================================
const buildFilterUrl = (filters, groupKey, groupValue) => {
  const params = new URLSearchParams();

  // Map groupKey to backend param name
  const keyMap = {
    brand: 'brandName',
    type: 'typeName',
    location: 'locationName',
    status: 'status',
    model: 'modelName',
  };

  // If we have a specific group selection, that becomes the primary filter
  // We only include other filters that are NOT superseded by the group selection
  if (groupKey && groupValue && keyMap[groupKey]) {
    // The clicked item is the main filter
    params.append(keyMap[groupKey], groupValue);

    // Determine which filters to include based on hierarchy:
    // - If clicking on a MODEL → model is specific, no need for brand/type (model implies them)
    // - If clicking on a BRAND → only include brand, models would be too specific
    // - If clicking on a TYPE → only include type
    // - If clicking on a LOCATION → include location, can combine with other filters
    // - If clicking on a STATUS → include status, can combine with other filters

    if (groupKey === 'model') {
      // Model is very specific - only add location/status if present (single values)
      if (filters?.location) params.append('locationName', filters.location);
      if (filters?.status) params.append('status', filters.status);
    } else if (groupKey === 'brand') {
      // Brand selected - can add type/location/status but not specific models
      if (filters?.type) params.append('typeName', filters.type);
      if (filters?.location) params.append('locationName', filters.location);
      if (filters?.status) params.append('status', filters.status);
    } else if (groupKey === 'type') {
      // Type selected - can add brand/location/status
      if (filters?.brand) params.append('brandName', filters.brand);
      if (filters?.location) params.append('locationName', filters.location);
      if (filters?.status) params.append('status', filters.status);
    } else if (groupKey === 'location') {
      // Location selected - can combine with brand/type/model/status
      if (filters?.brand) params.append('brandName', filters.brand);
      if (filters?.type) params.append('typeName', filters.type);
      if (filters?.model) params.append('modelName', filters.model);
      if (filters?.status) params.append('status', filters.status);
    } else if (groupKey === 'status') {
      // Status selected - can combine with brand/type/model/location
      if (filters?.brand) params.append('brandName', filters.brand);
      if (filters?.type) params.append('typeName', filters.type);
      if (filters?.model) params.append('modelName', filters.model);
      if (filters?.location) params.append('locationName', filters.location);
    }
  } else {
    // No group selection - include all filters from the original query
    // Single values
    if (filters?.brand) params.append('brandName', filters.brand);
    if (filters?.type) params.append('typeName', filters.type);
    if (filters?.model) params.append('modelName', filters.model);
    if (filters?.location) params.append('locationName', filters.location);
    if (filters?.status) params.append('status', filters.status);

    // Arrays (multiple values)
    if (filters?.brands && Array.isArray(filters.brands)) {
      filters.brands.forEach((b) => params.append('brandName', b));
    }
    if (filters?.types && Array.isArray(filters.types)) {
      filters.types.forEach((t) => params.append('typeName', t));
    }
    if (filters?.models && Array.isArray(filters.models)) {
      filters.models.forEach((m) => params.append('modelName', m));
    }
    if (filters?.locations && Array.isArray(filters.locations)) {
      filters.locations.forEach((l) => params.append('locationName', l));
    }
    if (filters?.statuses && Array.isArray(filters.statuses)) {
      filters.statuses.forEach((s) => params.append('status', s));
    }
  }

  // Note: Don't include 'enabled' - backend already filters enabled:true by default

  const queryString = params.toString();
  return queryString ? `/inventories?${queryString}` : '/inventories';
};

// ============================================
// Subcomponent: Search Input
// ============================================
const SearchInput = ({
  value,
  onChange,
  onSubmit,
  onClear,
  loading,
  disabled,
}) => (
  <form onSubmit={onSubmit} className="relative">
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-stretch">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || disabled}
          placeholder="Escribe tu consulta en lenguaje natural..."
          className="w-full h-10 pl-10 pr-10 text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!value.trim() || loading || disabled}
        className="h-10 px-5 inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span className="hidden sm:inline">Buscando...</span>
            <span className="sm:hidden">...</span>
          </>
        ) : (
          <>
            <HiSearch className="h-4 w-4" />
            <span>Buscar</span>
          </>
        )}
      </button>
    </div>
  </form>
);

// ============================================
// Subcomponent: Suggestions Grid
// ============================================
const SuggestionsGrid = ({ suggestions, onSelect }) => {
  const categoryIcons = {
    Listas: HiCollection,
    Conteos: HiChartBar,
    Agrupaciones: HiDatabase,
    Faltantes: HiExclamationCircle,
    Gráficas: HiChartPie,
  };

  const categoryColors = {
    Listas: 'from-blue-500 to-blue-600',
    Conteos: 'from-green-500 to-green-600',
    Agrupaciones: 'from-purple-500 to-purple-600',
    Faltantes: 'from-orange-500 to-orange-600',
    Gráficas: 'from-pink-500 to-rose-500',
  };

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        variants={fadeInUp}
      >
        <HiLightBulb className="h-5 w-5 text-yellow-500" />
        <span>Prueba con alguna de estas consultas:</span>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {suggestions.map((category, idx) => {
          const Icon = categoryIcons[category.category] || HiCollection;
          const gradient =
            categoryColors[category.category] || 'from-gray-500 to-gray-600';

          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${gradient} px-4 py-2`}>
                <div className="flex items-center gap-2 text-white">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">
                    {category.category}
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {category.examples.slice(0, 3).map((example, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => onSelect(example)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg px-3 py-2 transition-colors line-clamp-2"
                  >
                    &ldquo;{example}&rdquo;
                  </motion.button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ============================================
// Subcomponent: Count Result (Big Number)
// ============================================
const CountResult = ({ total, message, filters }) => {
  const filterUrl = buildFilterUrl(filters);
  const [displayNumber, setDisplayNumber] = useState(0);

  // Animated counter effect
  useEffect(() => {
    const target = total || 0;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayNumber(target);
        clearInterval(timer);
      } else {
        setDisplayNumber(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [total]);

  return (
    <motion.div
      className="text-center py-8 sm:py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="relative inline-flex items-center justify-center"
        variants={scaleIn}
      >
        {/* Animated rings */}
        <motion.div
          className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-purple-200 dark:border-purple-800"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-pink-200 dark:border-pink-800"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />

        {/* Main circle with number */}
        <motion.div
          className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-full flex items-center justify-center shadow-xl"
          initial={pulseGlow.initial}
          animate={pulseGlow.animate}
        >
          <motion.span
            className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            key={displayNumber}
          >
            {displayNumber.toLocaleString()}
          </motion.span>
        </motion.div>
      </motion.div>

      <motion.p
        className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mt-8 mb-6"
        variants={fadeInUp}
      >
        {message || 'inventarios encontrados'}
      </motion.p>

      <motion.a
        href={filterUrl}
        variants={fadeInUp}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 10px 40px rgba(147, 51, 234, 0.3)',
        }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
      >
        <HiExternalLink className="h-5 w-5" />
        Ver todos los inventarios
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <HiArrowRight className="h-4 w-4" />
        </motion.span>
      </motion.a>
    </motion.div>
  );
};

// ============================================
// Subcomponent: Grouped Result (Visual Bars)
// ============================================
const GroupedResult = ({ rows, groupBy, total, filters }) => {
  const maxCount = Math.max(...rows.map((r) => Number(r.count) || 0), 1);

  const groupByConfig = {
    brand: { label: 'Marca', icon: HiTag, color: 'purple' },
    type: { label: 'Tipo', icon: HiCube, color: 'blue' },
    model: { label: 'Modelo', icon: HiDocumentText, color: 'green' },
    location: { label: 'Ubicación', icon: HiLocationMarker, color: 'orange' },
    status: { label: 'Estado', icon: HiOfficeBuilding, color: 'pink' },
  };

  const config = groupByConfig[groupBy] || {
    label: groupBy,
    icon: HiDatabase,
    color: 'gray',
  };
  const Icon = config.icon;

  const colorClasses = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    gray: 'from-gray-500 to-gray-600',
  };

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-700"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[config.color]} text-white`}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Agrupado por {config.label}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {rows.length} grupos encontrados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="purple" size="lg">
            {total?.toLocaleString() || 0} total
          </Badge>
          <motion.a
            href={buildFilterUrl(filters)}
            className="text-purple-600 hover:text-purple-800 dark:text-purple-400"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiExternalLink className="h-5 w-5" />
          </motion.a>
        </div>
      </motion.div>

      {/* Bars */}
      <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {rows.map((row, idx) => {
          const percentage =
            maxCount > 0 ? (Number(row.count) / maxCount) * 100 : 0;
          const filterUrl = buildFilterUrl(filters, groupBy, row.key);

          return (
            <motion.a
              key={idx}
              href={filterUrl}
              className="group flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
              whileHover={{ x: 4 }}
            >
              <div className="w-28 sm:w-40 flex-shrink-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate block group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                  {row.key || '(sin valor)'}
                </span>
              </div>
              <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${colorClasses[config.color]} rounded-full flex items-center justify-end px-3`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(percentage, 8)}%` }}
                  transition={{
                    delay: idx * 0.05 + 0.2,
                    duration: 0.8,
                    ease: 'easeOut',
                  }}
                >
                  <motion.span
                    className="text-xs font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 + 0.6 }}
                  >
                    {Number(row.count).toLocaleString()}
                  </motion.span>
                </motion.div>
              </div>
              <motion.div whileHover={{ scale: 1.2 }}>
                <HiExternalLink className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0" />
              </motion.div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
};

// ============================================
// Subcomponent: Chart Result (Pie/Doughnut)
// ============================================
const CHART_COLORS = [
  'rgba(147, 51, 234, 0.8)', // Purple
  'rgba(236, 72, 153, 0.8)', // Pink
  'rgba(59, 130, 246, 0.8)', // Blue
  'rgba(34, 197, 94, 0.8)', // Green
  'rgba(251, 146, 60, 0.8)', // Orange
  'rgba(6, 182, 212, 0.8)', // Cyan
  'rgba(249, 115, 22, 0.8)', // Deep Orange
  'rgba(139, 92, 246, 0.8)', // Violet
  'rgba(14, 165, 233, 0.8)', // Sky
  'rgba(168, 85, 247, 0.8)', // Purple Light
  'rgba(244, 63, 94, 0.8)', // Rose
  'rgba(34, 211, 238, 0.8)', // Teal
];

const ChartResult = ({ rows, groupBy, total, filters, chartType = 'pie' }) => {
  const chartRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const groupByConfig = {
    brand: { label: 'Marca', icon: HiTag },
    type: { label: 'Tipo', icon: HiCube },
    model: { label: 'Modelo', icon: HiDocumentText },
    location: { label: 'Ubicación', icon: HiLocationMarker },
    status: { label: 'Estado', icon: HiOfficeBuilding },
  };

  const config = groupByConfig[groupBy] || { label: groupBy, icon: HiDatabase };
  const Icon = config.icon;

  // Prepare chart data
  const labels = rows.map((r) => r.key || '(sin valor)');
  const dataValues = rows.map((r) => Number(r.count) || 0);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: CHART_COLORS.slice(0, labels.length),
        borderColor: CHART_COLORS.slice(0, labels.length).map((c) =>
          c.replace('0.8', '1'),
        ),
        borderWidth: 2,
      },
    ],
  };

  // Limit legend items for better display (max 20 visible)
  const MAX_LEGEND_ITEMS = 20;
  const hasMoreItems = labels.length > MAX_LEGEND_ITEMS;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
          color: document.documentElement.classList.contains('dark')
            ? '#e5e7eb'
            : '#374151',
          // Limit the number of legend items shown
          filter: function (legendItem, chartData) {
            return legendItem.index < MAX_LEGEND_ITEMS;
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed;
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  const ChartComponent = chartType === 'doughnut' ? Doughnut : Pie;

  // Download chart as PNG image
  const handleDownloadImage = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const canvas = chart.canvas;
    const link = document.createElement('a');
    link.download = `grafica-${groupBy}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  }, [groupBy]);

  // Copy chart image to clipboard
  const handleCopyImage = useCallback(async () => {
    const chart = chartRef.current;
    if (!chart) return;

    try {
      const canvas = chart.canvas;
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error('Error copying to clipboard:', err);
            // Fallback: try to copy data as text
            handleCopyDataAsText();
          }
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error creating blob:', err);
    }
  }, []);

  // Fallback: Copy data as CSV text
  const handleCopyDataAsText = useCallback(() => {
    const csvData = [
      `${config.label},Cantidad,Porcentaje`,
      ...rows.map((row) => {
        const percentage =
          total > 0 ? ((row.count / total) * 100).toFixed(1) : 0;
        return `"${row.key || '(sin valor)'}",${row.count},${percentage}%`;
      }),
    ].join('\n');

    navigator.clipboard.writeText(csvData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [rows, total, config.label]);

  // Download data as CSV
  const handleDownloadCSV = useCallback(() => {
    const csvData = [
      `${config.label},Cantidad,Porcentaje`,
      ...rows.map((row) => {
        const percentage =
          total > 0 ? ((row.count / total) * 100).toFixed(1) : 0;
        return `"${row.key || '(sin valor)'}",${row.count},${percentage}%`;
      }),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `datos-${groupBy}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [rows, total, groupBy, config.label]);

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-700"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <HiChartPie className="h-5 w-5" />
          </motion.div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Gráfica por {config.label}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {rows.length} categorías • {total?.toLocaleString() || 0} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Action Buttons */}
          <Tooltip content="Descargar imagen PNG">
            <motion.button
              onClick={handleDownloadImage}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HiDownload className="h-4 w-4" />
            </motion.button>
          </Tooltip>
          <Tooltip content={copied ? '¡Copiado!' : 'Copiar imagen'}>
            <motion.button
              onClick={handleCopyImage}
              className={`p-2 rounded-lg transition-colors ${
                copied
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <HiClipboardCheck className="h-4 w-4" />
              ) : (
                <HiClipboard className="h-4 w-4" />
              )}
            </motion.button>
          </Tooltip>
          <Tooltip content="Descargar datos CSV">
            <motion.button
              onClick={handleDownloadCSV}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HiDocumentText className="h-4 w-4" />
            </motion.button>
          </Tooltip>
          <Badge
            color="purple"
            size="lg"
            className="whitespace-nowrap flex-shrink-0"
          >
            <HiChartPie className="h-4 w-4 mr-1" />
            {chartType === 'doughnut' ? 'Dona' : 'Pastel'}
          </Badge>
        </div>
      </motion.div>

      {/* Chart Container */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
        variants={scaleIn}
      >
        <div className="h-80 sm:h-96">
          <ChartComponent
            ref={chartRef}
            data={chartData}
            options={chartOptions}
          />
        </div>
        {/* Indicator for hidden legend items */}
        {hasMoreItems && (
          <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            +{labels.length - MAX_LEGEND_ITEMS} categorías más (ver detalle
            abajo)
          </div>
        )}
      </motion.div>

      {/* Summary Table - Collapsible */}
      <motion.div
        variants={fadeInUp}
        className="border-t border-gray-100 dark:border-gray-700 pt-4"
      >
        <details className="group">
          <summary className="cursor-pointer flex items-center justify-between gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 select-none">
            <div className="flex items-center gap-2">
              <HiChartBar className="h-4 w-4" />
              <span>Ver todas las categorías</span>
              <Badge color={hasMoreItems ? 'purple' : 'gray'} size="sm">
                {rows.length} total
              </Badge>
            </div>
            <span className="text-xs text-gray-500 group-open:rotate-90 transition-transform">
              ▶
            </span>
          </summary>
          <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {rows.map((row, idx) => (
                <motion.a
                  key={idx}
                  href={buildFilterUrl(filters, groupBy, row.key)}
                  className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-gray-100 dark:border-gray-600"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {row.key || '(sin valor)'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {Number(row.count).toLocaleString()}
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </details>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// Subcomponent: List Result (Table/Cards)
// ============================================
const ListResult = ({
  items,
  total,
  hasMore,
  page,
  limit,
  onPageChange,
  filters,
  message,
}) => {
  const totalPages = Math.ceil(total / (limit || 50));
  const filterUrl = buildFilterUrl(filters);

  if (!items || items.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <HiCollection className="h-10 w-10 text-gray-400" />
        </motion.div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No se encontraron resultados
        </p>
      </motion.div>
    );
  }

  const statusColors = {
    ALTA: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    BAJA: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    PROPUESTA:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  };

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-700"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <HiCollection className="h-5 w-5" />
          </motion.div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {message || `${total} inventarios encontrados`}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {items.length} de {total}
            </p>
          </div>
        </div>
        <motion.a
          href={filterUrl}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors self-start sm:self-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HiExternalLink className="h-4 w-4" />
          Ver todos
        </motion.a>
      </motion.div>

      {/* Cards Grid (Mobile) */}
      <div className="sm:hidden space-y-3 max-h-96 overflow-y-auto pr-2">
        {items.map((item, idx) => (
          <motion.a
            key={item.id}
            href={`/inventories/view/${item.id}`}
            className="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-gray-900 dark:text-white truncate">
                  {item.brandName} {item.modelName}
                </h5>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {item.typeName}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}
              >
                {item.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Serial:
                </span>
                <span className="ml-1 text-gray-700 dark:text-gray-300">
                  {item.serialNumber || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Ubicación:
                </span>
                <span className="ml-1 text-gray-700 dark:text-gray-300">
                  {item.locationName || '-'}
                </span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto max-h-96">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Marca / Modelo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Serial
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map((item, idx) => (
              <motion.tr
                key={item.id}
                className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: idx * 0.03,
                  type: 'spring',
                  stiffness: 300,
                }}
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.brandName} {item.modelName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {item.typeName}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {item.serialNumber || '-'}
                  </div>
                  {item.activeNumber && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Act: {item.activeNumber}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900 dark:text-gray-300">
                    {item.locationName || (
                      <span className="text-gray-400">Sin ubicación</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <motion.a
                    href={`/inventories/view/${item.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <HiExternalLink className="h-4 w-4" />
                    Ver
                  </motion.a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="flex justify-center items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiChevronLeft className="h-5 w-5" />
          </motion.button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página <span className="font-medium">{page}</span> de{' '}
            <span className="font-medium">{totalPages}</span>
          </span>
          <motion.button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiChevronRight className="h-5 w-5" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================
// Subcomponent: Error Alert
// ============================================
const ErrorAlert = ({ message, onRetry }) => (
  <motion.div
    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 200 }}
  >
    <motion.div
      className="flex-shrink-0"
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 0.5, repeat: 2 }}
    >
      <HiExclamationCircle className="h-6 w-6 text-red-500" />
    </motion.div>
    <div className="flex-1">
      <h4 className="font-medium text-red-800 dark:text-red-400">
        Error en la consulta
      </h4>
      <p className="text-sm text-red-600 dark:text-red-300">{message}</p>
    </div>
    <motion.button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <HiRefresh className="h-4 w-4" />
      </motion.span>
      Reintentar
    </motion.button>
  </motion.div>
);

// ============================================
// Subcomponent: Loading State
// ============================================
const LoadingState = () => (
  <motion.div
    className="flex flex-col items-center justify-center py-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="relative">
      {/* Outer ring */}
      <motion.div
        className="w-20 h-20 rounded-full border-4 border-purple-100 dark:border-purple-900"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute top-1 left-1 w-[72px] h-[72px] rounded-full border-4 border-transparent border-t-purple-400 dark:border-t-purple-600"
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute top-2 left-2 w-16 h-16 rounded-full border-4 border-transparent border-t-pink-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center icon */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <HiSparkles className="h-6 w-6 text-purple-600" />
      </motion.div>
    </div>
    <motion.p
      className="mt-6 text-gray-600 dark:text-gray-300 font-medium"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Analizando tu consulta...
    </motion.p>
    <motion.p
      className="text-sm text-gray-400 dark:text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      Esto puede tomar unos segundos
    </motion.p>
  </motion.div>
);

// ============================================
// Main Component: AIAgentModal
// ============================================
const AIAgentModal = () => {
  const {
    isModalOpen,
    isHealthy,
    closeModal,
    setQuery: setContextQuery,
  } = useAIAgent();

  const [localQuery, setLocalQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState(''); // Query that was actually executed
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isResultReady, setIsResultReady] = useState(false); // For animation mounting

  // Load suggestions on mount
  useEffect(() => {
    if (isModalOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isModalOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setLocalQuery('');
      setActiveQuery('');
      setResult(null);
      setError(null);
      setShowSuggestions(true);
      setCurrentPage(1);
      setIsResultReady(false);
    }
  }, [isModalOpen]);

  const loadSuggestions = async () => {
    try {
      const data = await aiService.getSuggestions();
      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setSuggestions([
        {
          category: 'Listas',
          examples: [
            'Lista inventarios Avigilon',
            'Inventarios ALTA en ubicación CCTV',
            'Muéstrame laptops HP',
          ],
        },
        {
          category: 'Conteos',
          examples: [
            'Cuántos inventarios hay de marca HP',
            'Total de inventarios BAJA',
            'Cuántos inventarios no tienen serie',
          ],
        },
        {
          category: 'Agrupaciones',
          examples: [
            'Cuántos inventarios hay por ubicación',
            'Conteo por marca',
            'Cuántos por tipo de inventario',
          ],
        },
        {
          category: 'Gráficas',
          examples: [
            'Gráfica de pastel por marca',
            'Gráfica de dona por tipo',
            'Gráfica circular por ubicación',
          ],
        },
      ]);
    }
  };

  const handleSearch = async (query = localQuery, page = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    setCurrentPage(page);
    setActiveQuery(query); // Store the active query for pagination
    setIsResultReady(false);

    try {
      const data = await aiService.query(query, { page, limit: 50 });
      setResult(data);
      setContextQuery(query);
      // Small delay for animation mounting
      setTimeout(() => setIsResultReady(true), 50);
    } catch (err) {
      setError(err.message || 'Error al procesar la consulta');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handlePageChange = (page) => {
    // Use activeQuery instead of localQuery for pagination
    handleSearch(activeQuery || localQuery, page);
  };

  const handleClear = () => {
    setLocalQuery('');
    setActiveQuery('');
    setResult(null);
    setError(null);
    setShowSuggestions(true);
    setIsResultReady(false);
  };

  const handleUseSuggestion = (example) => {
    setLocalQuery(example);
    handleSearch(example);
  };

  // Detect if user wants a chart from the query
  const detectChartRequest = (query) => {
    const lowerQuery = (query || '').toLowerCase();
    const chartKeywords = [
      'gráfica',
      'grafica',
      'chart',
      'pie',
      'pastel',
      'dona',
      'donut',
      'doughnut',
      'circular',
    ];
    const wantsChart = chartKeywords.some((keyword) =>
      lowerQuery.includes(keyword),
    );

    // Detect chart type
    let chartType = 'pie';
    if (
      lowerQuery.includes('dona') ||
      lowerQuery.includes('donut') ||
      lowerQuery.includes('doughnut')
    ) {
      chartType = 'doughnut';
    }

    return { wantsChart, chartType };
  };

  // Render result based on type
  const renderResult = () => {
    if (!result) return null;

    const {
      type,
      total,
      items,
      rows,
      groupBy,
      message,
      hasMore,
      page,
      limit,
      plan,
    } = result;
    const filters = plan?.filters || {};

    // Check if user wants a chart
    const { wantsChart, chartType } = detectChartRequest(
      activeQuery || localQuery,
    );

    if (type === 'aggregation') {
      if (rows && groupBy) {
        // If user requested a chart, show ChartResult
        if (wantsChart) {
          return (
            <ChartResult
              rows={rows}
              groupBy={groupBy}
              total={total}
              filters={filters}
              chartType={chartType}
            />
          );
        }
        // Otherwise show grouped bars
        return (
          <GroupedResult
            rows={rows}
            groupBy={groupBy}
            total={total}
            filters={filters}
          />
        );
      }
      return <CountResult total={total} message={message} filters={filters} />;
    }

    if (type === 'list' || type === 'mixed') {
      return (
        <ListResult
          items={items}
          total={total}
          hasMore={hasMore}
          page={page || currentPage}
          limit={limit}
          onPageChange={handlePageChange}
          filters={filters}
          message={message}
        />
      );
    }

    return null;
  };

  return (
    <Modal
      show={isModalOpen}
      onClose={closeModal}
      size="6xl"
      popup={false}
      className="ai-agent-modal"
    >
      {/* Custom Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
            <HiSparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Búsqueda Inteligente
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              Busca inventarios usando lenguaje natural
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isHealthy ? (
            <Tooltip content="Servicio de IA activo">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/40 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700 dark:text-green-400 hidden sm:inline">
                  Activo
                </span>
              </div>
            </Tooltip>
          ) : (
            <Tooltip content="Servicio de IA no disponible">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/40 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs font-medium text-red-700 dark:text-red-400 hidden sm:inline">
                  Offline
                </span>
              </div>
            </Tooltip>
          )}
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiX className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 min-h-[400px] sm:min-h-[500px] max-h-[calc(100vh-250px)] overflow-y-auto dark:bg-gray-800">
        {/* Search Input */}
        <div className="mb-6">
          <SearchInput
            value={localQuery}
            onChange={setLocalQuery}
            onSubmit={handleSubmit}
            onClear={handleClear}
            loading={loading}
            disabled={!isHealthy}
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ErrorAlert message={error} onRetry={() => handleSearch()} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>{loading && <LoadingState />}</AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {!loading && result && isResultReady && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {/* Debug info (collapsible) */}
              {result.plan && (
                <details className="mb-4 text-xs">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    Ver detalles técnicos ({result.elapsed})
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto text-gray-600 dark:text-gray-400">
                    {JSON.stringify(result.plan, null, 2)}
                  </pre>
                </details>
              )}
              {renderResult()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions */}
        <AnimatePresence>
          {!loading && !result && showSuggestions && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SuggestionsGrid
                suggestions={suggestions}
                onSelect={handleUseSuggestion}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
          {result && (
            <span>
              Consulta procesada en{' '}
              <span className="font-medium">{result.elapsed || '~'}</span>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {result && (
            <motion.button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HiRefresh className="h-4 w-4" />
              Nueva búsqueda
            </motion.button>
          )}
          <motion.button
            onClick={closeModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cerrar
          </motion.button>
        </div>
      </div>

      {/* Custom styles */}
      <style>{`
        .ai-agent-modal .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .ai-agent-modal .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .ai-agent-modal .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7c7c7;
          border-radius: 3px;
        }
        .ai-agent-modal .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </Modal>
  );
};

export default AIAgentModal;
