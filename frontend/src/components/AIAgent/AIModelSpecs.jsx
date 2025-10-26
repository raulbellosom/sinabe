import React from 'react';
import { Card, Button, Badge, Spinner, Alert } from 'flowbite-react';
import {
  HiX,
  HiChip,
  HiSparkles,
  HiInformationCircle,
  HiCube,
} from 'react-icons/hi';
import { useAIAgent } from '../../context/AIAgentContext.jsx';

const AIModelSpecs = ({ item, specs, onClose }) => {
  const { isLoading, error } = useAIAgent();

  // Format specs text for better display
  const formatSpecs = (specsText) => {
    if (!specsText) return [];

    return specsText
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => line.trim());
  };

  const formattedSpecs = formatSpecs(specs?.specs);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <HiChip className="text-2xl text-purple-500" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Ficha Técnica Generada por IA
              </h3>
              <p className="text-sm text-gray-600">
                {item.brandName} {item.modelName}
              </p>
            </div>
          </div>
          <Button
            color="gray"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-1"
          >
            <HiX />
          </Button>
        </div>

        {/* Item Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Marca:</span>
              <span className="ml-2">{item.brandName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Modelo:</span>
              <span className="ml-2">{item.modelName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tipo:</span>
              <span className="ml-2">{item.typeName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Serial:</span>
              <span className="ml-2 font-mono bg-white px-2 py-1 rounded">
                {item.serialNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <Spinner size="lg" />
            <p className="mt-2 text-gray-600">
              Generando ficha técnica con IA...
            </p>
            <p className="text-sm text-gray-500">
              Esto puede tomar varios segundos
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert color="failure" className="mb-4">
            <HiInformationCircle className="mr-2" />
            <span className="font-medium">Error:</span> {error}
          </Alert>
        )}

        {/* Specs Content */}
        {!isLoading && !error && specs && (
          <div className="space-y-4">
            {/* AI Generated Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge
                color="purple"
                size="sm"
                className="flex items-center gap-1"
              >
                <HiSparkles className="text-xs" />
                Generado por IA
              </Badge>
              <span className="text-xs text-gray-500">
                Esta información es estimada y puede no ser 100% precisa
              </span>
            </div>

            {/* Specifications */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <HiCube className="text-purple-500" />
                Especificaciones Técnicas Probables
              </h4>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                {formattedSpecs.length > 0 ? (
                  <ul className="space-y-2">
                    {formattedSpecs.map((spec, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-purple-500 mt-1">•</span>
                        <span className="text-gray-700">
                          {spec.replace(/^-\s*/, '')}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">
                    {specs.specs ||
                      'No se pudieron generar especificaciones para este modelo.'}
                  </p>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <HiInformationCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">
                    Nota importante:
                  </p>
                  <p className="text-yellow-700">
                    Esta ficha técnica ha sido generada automáticamente por IA
                    basándose en el modelo y marca del equipo. Las
                    especificaciones pueden variar según la configuración
                    específica del producto. Para información precisa, consulte
                    la documentación oficial del fabricante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <Button color="gray" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIModelSpecs;
