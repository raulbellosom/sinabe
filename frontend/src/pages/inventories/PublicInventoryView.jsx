/**
 * PublicInventoryView.jsx
 * Página pública para consultar inventarios mediante QR / handheld scanner.
 * No requiere autenticación.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getPublicInventory, API_URL } from '../../services/api';
import { Spinner, Badge } from '../../components/ui/flowbite';
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Hash,
  Layers,
  LogIn,
  MapPin,
  Moon,
  Package,
  Pencil,
  QrCode,
  RotateCcw,
  Search,
  Sun,
  Tag,
  User,
  X,
} from 'lucide-react';
import { useTheme } from '../../providers/theme/useTheme';
import sinabeIcon from '../../assets/logo/sinabe_icon.png';
import gapLogo from '../../assets/logo/gap.png';

/* ── helpers ───────────────────────────────────────── */

const statusConfig = {
  ALTA: {
    label: 'Alta',
    color: 'green',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  BAJA: {
    label: 'Baja',
    color: 'red',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  PROPUESTA: {
    label: 'Propuesta',
    color: 'yellow',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
};

const getStatusCfg = (status) => statusConfig[status] || statusConfig.ALTA;

/**
 * Parsea el contenido completo de un QR de inventario SINABE.
 * Formato esperado (multi-línea):
 *   http://…/inventory/public/<UUID>
 *   Folio:CAM-AVI-12W-011 | SN:NC312399U23 | Activo:PVR-OC-4444 | Modelo:… | Marca:… | Tipo:… | Estado:…
 *
 * Retorna el mejor identificador para buscar en el backend, con esta prioridad:
 *   1. UUID (extraído de la URL)
 *   2. Folio interno
 *   3. Número de serie (SN)
 *   4. Número de activo
 *   5. El texto original (fallback)
 */
function parseQRInput(raw) {
  if (!raw) return null;
  const input = raw.trim();

  // Intentar extraer UUID de una URL o del texto plano
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const uuidMatch = input.match(uuidRegex);

  // Intentar parsear campos tipo "Folio:XXX | SN:YYY | …"
  const fieldMap = {};
  const fieldRegex = /(\w+):([^|]+)/g;
  let m;
  while ((m = fieldRegex.exec(input)) !== null) {
    fieldMap[m[1].trim().toLowerCase()] = m[2].trim();
  }

  // Prioridad de búsqueda
  if (uuidMatch) return uuidMatch[0];
  if (fieldMap.folio) return fieldMap.folio;
  if (fieldMap.sn) return fieldMap.sn;
  if (fieldMap.activo) return fieldMap.activo;

  // Fallback: si no hay campos, usar el texto tal cual (podría ser un folio pegado directo)
  // Tomar solo la primera línea si hay saltos
  const firstLine = input.split('\n')[0].trim();
  const firstLineUuid = firstLine.match(uuidRegex);
  if (firstLineUuid) return firstLineUuid[0];

  return firstLine || null;
}

/* ── componente ────────────────────────────────────── */

const PublicInventoryView = () => {
  const { id: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [inventoryId, setInventoryId] = useState(() => paramId || '');
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const inputRef = useRef(null);

  // Fetch inventory data
  const fetchInventory = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setInventory(null);
    try {
      const data = await getPublicInventory(id);
      setInventory(data);
      document.title = `SINABE - ${data.internalFolio || data.model?.name || 'Inventario'}`;
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Inventario no encontrado'
          : err.response?.data?.message || 'Error al consultar inventario';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount if param or query string present
  useEffect(() => {
    const targetId = paramId || searchParams.get('id');
    if (targetId) {
      const extracted = parseQRInput(targetId);
      if (extracted) {
        setInventoryId(extracted);
        fetchInventory(extracted);
      }
    }
    return () => {
      document.title = 'SINABE - Sistema de Inventarios y Bienes';
    };
  }, [paramId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e?.preventDefault();
    const extracted = parseQRInput(inventoryId);
    if (extracted) {
      navigate(`/inventory/public/${encodeURIComponent(extracted)}`, {
        replace: true,
      });
      fetchInventory(extracted);
    }
  };

  const handleClear = () => {
    setInventoryId('');
    setInventory(null);
    setError(null);
    navigate('/inventory/public', { replace: true });
    inputRef.current?.focus();
  };

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const sCfg = inventory ? getStatusCfg(inventory.status) : null;
  const isDark = resolvedTheme === 'dark';

  /* ── render ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-xs border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={sinabeIcon} alt="SINABE" className="h-8 w-auto" />
            <div>
              <h1 className="text-lg font-bold leading-tight">SINABE</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Consulta de inventario
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <img
              src={gapLogo}
              alt="GAP"
              className="h-8 w-auto opacity-60 dark:opacity-40"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ── Search bar ─────────────────────────────── */}
        <form
          onSubmit={handleSearch}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-4"
        >
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <QrCode size={16} />
            Escanea o ingresa el ID del inventario
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inventoryId}
                onChange={(e) => setInventoryId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch(e);
                }}
                placeholder="UUID, folio, SN, activo o pega datos del QR…"
                autoFocus
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-gray-50 dark:bg-gray-700 text-sm px-4 py-2.5 pr-10
                           text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                           placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              {inventoryId && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full
                             text-gray-400 hover:text-gray-600 hover:bg-gray-200
                             dark:hover:text-gray-300 dark:hover:bg-gray-600 transition"
                  title="Limpiar"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!inventoryId.trim() || loading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
                           hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
                           disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Search size={16} />
                Buscar
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 px-3 py-2.5 text-sm font-medium 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                title="Limpiar y escanear otro"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Escanea el código QR de la etiqueta o pega la URL / datos
            directamente. Busca por folio, UUID, número de serie o activo.
          </p>
        </form>

        {/* ── Loading state ──────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner size="xl" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Consultando inventario…
            </p>
          </div>
        )}

        {/* ── Error state ────────────────────────────── */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <AlertTriangle className="mx-auto mb-2 text-red-500" size={32} />
            <p className="text-red-700 dark:text-red-300 font-medium">
              {error}
            </p>
            <button
              onClick={handleClear}
              className="mt-4 inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
            >
              <RotateCcw size={14} />
              Intentar con otro
            </button>
          </div>
        )}

        {/* ── Inventory detail ───────────────────────── */}
        {inventory && !loading && (
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <a
                href={`/inventories/view/${inventory.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white
                           hover:bg-blue-700 transition shadow-xs"
              >
                <ExternalLink size={16} />
                Ver completo
              </a>
              <a
                href={`/inventories/edit/${inventory.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition shadow-xs"
              >
                <Pencil size={16} />
                Editar
              </a>
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition shadow-xs ml-auto"
              >
                <QrCode size={16} />
                Escanear otro
              </button>
            </div>

            {/* Main card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Status + headline */}
              <div className={`px-6 py-4 ${sCfg.bg} ${sCfg.border} border-b`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Package className={sCfg.text} size={24} />
                    <div>
                      <h2 className="text-lg font-bold">
                        {inventory.model?.name || '—'}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {inventory.model?.brand?.name} ·{' '}
                        {inventory.model?.type?.name}
                      </p>
                    </div>
                  </div>
                  <Badge color={sCfg.color} size="lg">
                    {sCfg.label}
                  </Badge>
                </div>
              </div>

              {/* Fields grid */}
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  icon={<Hash size={16} />}
                  label="Folio interno"
                  value={inventory.internalFolio}
                  onCopy={() =>
                    copyToClipboard(inventory.internalFolio, 'folio')
                  }
                  copied={copiedField === 'folio'}
                />
                <Field
                  icon={<Tag size={16} />}
                  label="Número de serie"
                  value={inventory.serialNumber}
                  onCopy={() => copyToClipboard(inventory.serialNumber, 'sn')}
                  copied={copiedField === 'sn'}
                />
                <Field
                  icon={<Layers size={16} />}
                  label="Número de activo"
                  value={inventory.activeNumber}
                  onCopy={() =>
                    copyToClipboard(inventory.activeNumber, 'active')
                  }
                  copied={copiedField === 'active'}
                />
                <Field
                  icon={<MapPin size={16} />}
                  label="Ubicación"
                  value={inventory.location?.name}
                />
                <Field
                  icon={<User size={16} />}
                  label="Creado por"
                  value={
                    inventory.createdBy
                      ? `${inventory.createdBy.firstName} ${inventory.createdBy.lastName}`
                      : null
                  }
                />
                <Field
                  icon={<Package size={16} />}
                  label="Modelo / Marca / Tipo"
                  value={`${inventory.model?.name || '—'} / ${inventory.model?.brand?.name || '—'} / ${inventory.model?.type?.name || '—'}`}
                />
                {inventory.receptionDate && (
                  <Field
                    icon={<Tag size={16} />}
                    label="Fecha de recepción"
                    value={inventory.receptionDate}
                  />
                )}
                {inventory.comments && (
                  <div className="sm:col-span-2">
                    <Field
                      icon={<Tag size={16} />}
                      label="Comentarios"
                      value={inventory.comments}
                    />
                  </div>
                )}
              </div>

              {/* Conditions */}
              {inventory.conditions?.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Condiciones
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {inventory.conditions.map((c, idx) => (
                      <Badge key={idx} color={sCfg.color} size="sm">
                        {c.condition?.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom fields */}
              {inventory.customField?.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Campos personalizados
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inventory.customField.map((cf) => (
                      <div
                        key={cf.id}
                        className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-sm"
                      >
                        <span className="text-gray-500 dark:text-gray-400">
                          {cf.customField?.name}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {cf.value || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verticals */}
              {inventory.model?.ModelVertical?.length > 0 && (
                <div className="px-6 pb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Verticales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {inventory.model.ModelVertical.map((mv) => (
                      <Badge key={mv.id} color="purple" size="sm">
                        {mv.vertical?.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {inventory.images?.length > 0 && (
                <div className="px-6 pb-5">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Imágenes
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {inventory.images.map((img) => (
                      <img
                        key={img.id}
                        src={`${API_URL}/${img.thumbnail || img.url}`}
                        alt="Inventario"
                        className="h-24 w-24 rounded-lg object-cover border border-gray-200 
                                   dark:border-gray-600 shrink-0"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Empty state ────────────────────────────── */}
        {!loading && !error && !inventory && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full p-6 mb-4">
              <QrCode className="text-blue-500" size={48} />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Escanea un código QR
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Usa tu dispositivo para escanear la etiqueta QR del equipo, o pega
              el enlace / datos directamente en el campo de búsqueda.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <img
              src={sinabeIcon}
              alt=""
              className="h-5 w-auto opacity-40 grayscale"
            />
            <span>SINABE · Sistema de Inventarios y Bienes</span>
          </div>
          <a
            href="/login"
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition"
          >
            <LogIn size={12} />
            Iniciar sesión
          </a>
        </div>
      </footer>
    </div>
  );
};

/* ── Sub-componente: campo de información ───────── */

function Field({ icon, label, value, onCopy, copied }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 group">
      <span className="mt-0.5 text-gray-400 dark:text-gray-500 shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 wrap-break-word">
          {value}
          {onCopy && (
            <button
              onClick={onCopy}
              className="ml-2 inline-flex items-center text-gray-400 hover:text-blue-500 
                         dark:text-gray-500 dark:hover:text-blue-400 transition opacity-0 group-hover:opacity-100"
              title="Copiar"
            >
              {copied ? (
                <Check size={13} className="text-green-500" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

export default PublicInventoryView;
