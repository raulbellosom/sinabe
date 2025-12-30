import React from 'react';
import { Modal, Button } from 'flowbite-react';
import { HiInformationCircle, HiClipboardCopy } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

/**
 * Modal de ayuda para expresiones CRON
 */
const CronHelpModal = ({ show, onClose }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const examples = [
    { cron: '0 9 * * *', description: 'Todos los días a las 9:00 AM' },
    { cron: '0 9 * * 1-5', description: 'Lunes a Viernes a las 9:00 AM' },
    {
      cron: '0 8,18 * * *',
      description: 'Todos los días a las 8:00 AM y 6:00 PM',
    },
    { cron: '0 0 1 * *', description: 'Primer día de cada mes a medianoche' },
    { cron: '0 12 * * 1', description: 'Todos los lunes a las 12:00 PM' },
    { cron: '*/30 * * * *', description: 'Cada 30 minutos' },
    { cron: '0 */6 * * *', description: 'Cada 6 horas' },
    { cron: '0 9 15 * *', description: 'El día 15 de cada mes a las 9:00 AM' },
  ];

  return (
    <Modal show={show} onClose={onClose} size="xl">
      <Modal.Header>
        <div className="flex items-center gap-2">
          <HiInformationCircle className="w-6 h-6 text-blue-500" />
          <span>Guía de Expresiones CRON</span>
        </div>
      </Modal.Header>
      <Modal.Body className="max-h-[70vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Estructura básica */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Estructura de una expresión CRON
            </h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="flex items-center gap-4 text-center min-w-max">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-blue-600">*</span>
                  <span className="text-xs text-gray-500 mt-1">Minuto</span>
                  <span className="text-xs text-gray-400">(0-59)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-green-600">*</span>
                  <span className="text-xs text-gray-500 mt-1">Hora</span>
                  <span className="text-xs text-gray-400">(0-23)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-yellow-600">*</span>
                  <span className="text-xs text-gray-500 mt-1">Día mes</span>
                  <span className="text-xs text-gray-400">(1-31)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-orange-600">*</span>
                  <span className="text-xs text-gray-500 mt-1">Mes</span>
                  <span className="text-xs text-gray-400">(1-12)</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-purple-600">*</span>
                  <span className="text-xs text-gray-500 mt-1">Día semana</span>
                  <span className="text-xs text-gray-400">(0-6)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Caracteres especiales */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Caracteres especiales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <code className="text-blue-700 dark:text-blue-300 font-bold">
                  *
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                  Cualquier valor
                </span>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <code className="text-green-700 dark:text-green-300 font-bold">
                  ,
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                  Lista de valores (1,3,5)
                </span>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <code className="text-yellow-700 dark:text-yellow-300 font-bold">
                  -
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                  Rango de valores (1-5)
                </span>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <code className="text-purple-700 dark:text-purple-300 font-bold">
                  /
                </code>
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                  Incremento (*/15 = cada 15)
                </span>
              </div>
            </div>
          </div>

          {/* Días de la semana */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Días de la semana
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                '0 - Dom',
                '1 - Lun',
                '2 - Mar',
                '3 - Mié',
                '4 - Jue',
                '5 - Vie',
                '6 - Sáb',
              ].map((day) => (
                <span
                  key={day}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Ejemplos comunes */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Ejemplos comunes
            </h3>
            <div className="space-y-2">
              {examples.map(({ cron, description }) => (
                <div
                  key={cron}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <code className="px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 text-sm font-mono text-blue-600 dark:text-blue-400">
                      {cron}
                    </code>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {description}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cron)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 rounded transition-all"
                    title="Copiar"
                  >
                    <HiClipboardCopy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Nota importante */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Nota:</strong> Las expresiones CRON usan la zona horaria
              del servidor. Asegúrate de considerar esto al programar tus
              notificaciones.
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

/**
 * Modal de ayuda para filtros JSON en consultas personalizadas
 */
const JsonFilterHelpModal = ({ show, onClose, entity = 'inventory' }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const entityExamples = {
    inventory: [
      {
        title: 'Por estado',
        description: 'Filtrar inventarios en estado ALTA',
        json: { status: 'ALTA' },
      },
      {
        title: 'Múltiples condiciones',
        description: 'Inventarios sin factura creados en los últimos 30 días',
        json: {
          invoiceId: null,
          createdAt: { gte: '2024-01-01' },
        },
      },
      {
        title: 'Por tipo de equipo',
        description: 'Filtrar por tipo específico (usando ID)',
        json: {
          model: { typeId: 1 },
        },
      },
      {
        title: 'Con condición OR',
        description: 'Sin factura O sin orden de compra',
        json: {
          OR: [{ invoiceId: null }, { purchaseOrderId: null }],
        },
      },
      {
        title: 'Búsqueda de texto',
        description: 'Buscar por número de serie que contenga texto',
        json: {
          serialNumber: { contains: 'ABC' },
        },
      },
    ],
    purchaseOrder: [
      {
        title: 'Por proveedor',
        description: 'Filtrar por nombre de proveedor',
        json: { supplier: { contains: 'Acme' } },
      },
      {
        title: 'Sin proyecto asignado',
        description: 'Órdenes de compra sin proyecto',
        json: { projectId: null },
      },
    ],
    invoice: [
      {
        title: 'Sin orden de compra',
        description: 'Facturas sin OC asociada',
        json: { purchaseOrderId: null },
      },
      {
        title: 'Por proveedor',
        description: 'Facturas de un proveedor específico',
        json: { supplier: { contains: 'Tech' } },
      },
    ],
    custodyRecord: [
      {
        title: 'En borrador',
        description: 'Resguardos pendientes de completar',
        json: { status: 'BORRADOR' },
      },
      {
        title: 'Completados',
        description: 'Resguardos finalizados',
        json: { status: 'COMPLETADO' },
      },
    ],
    model: [
      {
        title: 'Por marca',
        description: 'Modelos de una marca específica',
        json: { brandId: 1 },
      },
      {
        title: 'Por tipo',
        description: 'Modelos de un tipo específico',
        json: { typeId: 2 },
      },
    ],
    vertical: [
      {
        title: 'Habilitadas',
        description: 'Verticales activas',
        json: { enabled: true },
      },
    ],
    location: [
      {
        title: 'Por nombre',
        description: 'Ubicaciones que contengan texto',
        json: { name: { contains: 'Oficina' } },
      },
    ],
  };

  const examples = entityExamples[entity] || entityExamples.inventory;

  return (
    <Modal show={show} onClose={onClose} size="xl">
      <Modal.Header>
        <div className="flex items-center gap-2">
          <HiInformationCircle className="w-6 h-6 text-blue-500" />
          <span>Guía de Filtros JSON</span>
        </div>
      </Modal.Header>
      <Modal.Body className="max-h-[70vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Descripción */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Los filtros JSON permiten crear consultas personalizadas usando la
              sintaxis de Prisma. Esto te da control total sobre qué registros
              se incluyen en la notificación.
            </p>
          </div>

          {/* Operadores disponibles */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Operadores disponibles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  op: 'equals',
                  desc: 'Igual a un valor',
                  example: '{ "status": "ALTA" }',
                },
                {
                  op: 'not',
                  desc: 'Diferente de',
                  example: '{ "status": { "not": "BAJA" } }',
                },
                {
                  op: 'in',
                  desc: 'En una lista',
                  example: '{ "status": { "in": ["ALTA", "PROPUESTA"] } }',
                },
                {
                  op: 'contains',
                  desc: 'Contiene texto',
                  example: '{ "name": { "contains": "texto" } }',
                },
                {
                  op: 'startsWith',
                  desc: 'Empieza con',
                  example: '{ "code": { "startsWith": "INV" } }',
                },
                {
                  op: 'gt/gte',
                  desc: 'Mayor que / Mayor o igual',
                  example: '{ "amount": { "gte": 100 } }',
                },
                {
                  op: 'lt/lte',
                  desc: 'Menor que / Menor o igual',
                  example: '{ "quantity": { "lt": 10 } }',
                },
                {
                  op: 'null',
                  desc: 'Es nulo',
                  example: '{ "invoiceId": null }',
                },
              ].map(({ op, desc, example }) => (
                <div
                  key={op}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <code className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {op}
                  </code>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Operadores lógicos */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Operadores lógicos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <code className="text-green-700 dark:text-green-300 font-bold">
                  AND
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Todas las condiciones deben cumplirse
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <code className="text-yellow-700 dark:text-yellow-300 font-bold">
                  OR
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Al menos una condición debe cumplirse
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <code className="text-red-700 dark:text-red-300 font-bold">
                  NOT
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Negación de condiciones
                </p>
              </div>
            </div>
          </div>

          {/* Ejemplos para la entidad seleccionada */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Ejemplos para {entity}
            </h3>
            <div className="space-y-3">
              {examples.map(({ title, description, json }, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(JSON.stringify(json, null, 2))
                      }
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 rounded transition-all"
                      title="Copiar"
                    >
                      <HiClipboardCopy className="w-4 h-4" />
                    </button>
                  </div>
                  <pre className="mt-2 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(json, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>⚠️ Importante:</strong> Asegúrate de que el JSON sea
              válido. Usa comillas dobles para las claves y valores de texto.
              Puedes validar tu JSON en{' '}
              <a
                href="https://jsonlint.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-900 dark:hover:text-amber-100"
              >
                jsonlint.com
              </a>
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export { CronHelpModal, JsonFilterHelpModal };
