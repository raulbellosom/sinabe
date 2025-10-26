import React from 'react';
import { Card, Badge, Button, Tooltip } from 'flowbite-react';
import {
  HiExternalLink,
  HiInformationCircle,
  HiCalendar,
  HiHashtag,
  HiLocationMarker,
  HiDocument,
  HiCube,
  HiSparkles,
} from 'react-icons/hi';

const AIResultCard = ({
  result,
  onSelect,
  onViewSpecs,
  onNavigate,
  isSelected = false,
}) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ALTA':
        return 'success';
      case 'BAJA':
        return 'failure';
      case 'MANTENIMIENTO':
        return 'warning';
      default:
        return 'gray';
    }
  };

  // Parse custom fields
  const parseCustomFields = (customFieldsText) => {
    if (!customFieldsText) return {};

    const fields = {};
    const pairs = customFieldsText.split(' | ');

    pairs.forEach((pair) => {
      const [key, value] = pair.split(': ');
      if (key && value) {
        fields[key.trim()] = value.trim();
      }
    });

    return fields;
  };

  const customFields = parseCustomFields(result.customFieldsText);

  return (
    <Card
      className={`
        transition-all duration-200 hover:shadow-lg border-l-4 
        ${
          isSelected
            ? 'border-l-purple-500 bg-purple-50 shadow-md'
            : 'border-l-gray-300 hover:border-l-purple-400'
        }
      `}
    >
      <div className="space-y-4">
        {/* Header with brand, model and score */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="text-lg font-semibold text-gray-900">
                {result.brandName} {result.modelName}
              </h5>
              {result.score && (
                <Tooltip
                  content={`Relevancia: ${(result.score * 100).toFixed(1)}%`}
                >
                  <Badge
                    color="purple"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <HiSparkles className="text-xs" />
                    {(result.score * 100).toFixed(0)}%
                  </Badge>
                </Tooltip>
              )}
            </div>
            <p className="text-sm text-gray-600">{result.typeName}</p>
          </div>

          <Badge color={getStatusColor(result.status)}>{result.status}</Badge>
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <HiHashtag className="text-gray-400" />
            <span className="font-medium">Serial:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {result.serialNumber}
            </span>
          </div>

          {result.activeNumber && (
            <div className="flex items-center gap-2">
              <HiCube className="text-gray-400" />
              <span className="font-medium">No. Activo:</span>
              <span>{result.activeNumber}</span>
            </div>
          )}

          {result.receptionDate && (
            <div className="flex items-center gap-2">
              <HiCalendar className="text-gray-400" />
              <span className="font-medium">Fecha recepción:</span>
              <span>{formatDate(result.receptionDate)}</span>
            </div>
          )}

          {customFields.Ubicación && (
            <div className="flex items-center gap-2">
              <HiLocationMarker className="text-gray-400" />
              <span className="font-medium">Ubicación:</span>
              <span>{customFields.Ubicación}</span>
            </div>
          )}
        </div>

        {/* Purchase Information */}
        {(result.invoiceCode || result.purchaseOrderCode) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded">
            {result.invoiceCode && (
              <div className="flex items-center gap-2">
                <HiDocument className="text-gray-400" />
                <span className="font-medium">Factura:</span>
                <span className="font-mono">{result.invoiceCode}</span>
              </div>
            )}

            {result.purchaseOrderCode && (
              <div className="flex items-center gap-2">
                <HiDocument className="text-gray-400" />
                <span className="font-medium">O.C.:</span>
                <span className="font-mono">{result.purchaseOrderCode}</span>
              </div>
            )}

            {customFields.Proveedor && (
              <div className="flex items-center gap-2 md:col-span-2">
                <span className="font-medium">Proveedor:</span>
                <span>{customFields.Proveedor}</span>
              </div>
            )}
          </div>
        )}

        {/* Comments */}
        {result.comments && (
          <div className="text-sm">
            <span className="font-medium text-gray-700">Comentarios:</span>
            <p className="text-gray-600 mt-1 bg-gray-50 p-2 rounded italic">
              {result.comments}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <Button
            size="sm"
            color="purple"
            onClick={onNavigate}
            className="flex items-center gap-2"
          >
            <HiExternalLink />
            Ver Inventario
          </Button>

          <Button
            size="sm"
            color="light"
            onClick={onViewSpecs}
            className="flex items-center gap-2"
          >
            <HiInformationCircle />
            Ficha Técnica
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIResultCard;
