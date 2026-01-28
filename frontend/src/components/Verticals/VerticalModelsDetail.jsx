import React, { useState, useEffect } from 'react';
import { Badge, Button, TextInput } from 'flowbite-react';
import {
  FaChevronDown,
  FaChevronUp,
  FaTrashAlt,
  FaPlus,
  FaSearch,
  FaCheck,
  FaExchangeAlt,
} from 'react-icons/fa';
import classNames from 'classnames';
import ActionButtons from '../ActionButtons/ActionButtons';
import Notifies from '../Notifies/Notifies';
import ConfirmModal from '../Modals/ConfirmModal';

const VerticalModelsDetail = ({
  models = [],
  verticalId,
  removeModel,
  refetchVerticals,
  showFullDescription,
  setShowFullDescription,
  shouldExpandInModal,
  selectedDescription,
  assignModel,
  searchModels,
}) => {
  const [modelDetailsOpen, setModelDetailsOpen] = useState(null);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Confirm Modal State
  const [showConfirmUnassign, setShowConfirmUnassign] = useState(false);
  const [modelToUnassign, setModelToUnassign] = useState(null);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setIsSearching(true);
        try {
          // Pass NO excludeVerticalId to get all models and check their status ourselves
          const results = await searchModels(searchTerm, null);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchModels]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ALTA':
        return 'bg-green-100 text-green-800';
      case 'BAJA':
        return 'bg-red-100 text-red-800';
      case 'PROPUESTA':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleAssign = (modelId) => {
    assignModel.mutate(
      { modelId, verticalIds: [verticalId] },
      {
        onSuccess: async () => {
          await refetchVerticals();
          Notifies('success', 'Modelo asignado');
        },
      },
    );
  };

  const handleUnassignClick = (model) => {
    setModelToUnassign(model);
    setShowConfirmUnassign(true);
  };

  const confirmUnassign = () => {
    if (modelToUnassign) {
      removeModel.mutate(
        { modelId: modelToUnassign.id, verticalId },
        {
          onSuccess: async () => {
            await refetchVerticals();
            Notifies('success', 'Modelo desasignado');
            setShowConfirmUnassign(false);
            setModelToUnassign(null);
          },
        },
      );
    }
  };

  const displayedList = searchTerm.length > 2 ? searchResults : models;

  return (
    <div className="flex flex-col h-full">
      {/* Description Panel */}
      <div className="flex-none">
        <p className="text-sm text-gray-600 whitespace-pre-line mb-4">
          {showFullDescription || !shouldExpandInModal(selectedDescription)
            ? selectedDescription
            : selectedDescription.split('\n').slice(0, 5).join('\n') + '...'}
        </p>
        {shouldExpandInModal(selectedDescription) && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-xs text-sinabe-primary hover:underline mb-4"
          >
            {showFullDescription ? 'Ver menos' : 'Ver más'}
          </button>
        )}
        <hr className="my-4" />

        {/* Integrated Search */}
        <div className="mb-4">
          <TextInput
            icon={FaSearch}
            placeholder="Buscar modelo para asignar o filtrar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">
            {searchTerm.length > 2
              ? `Resultados de búsqueda (${displayedList.length})`
              : `Modelos asignados (${models.length})`}
          </h3>
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {displayedList.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {searchTerm.length > 2
              ? 'No se encontraron modelos.'
              : 'No hay modelos asignados.'}
          </div>
        ) : (
          displayedList.map((model) => {
            // Check status
            const isAssignedToCurrent =
              models.some((m) => m.id === model.id) ||
              model.ModelVertical?.some((mv) => mv.verticalId === verticalId);
            const assignedToOthers =
              model.ModelVertical?.filter(
                (mv) => mv.verticalId !== verticalId,
              ) || [];
            const isAssignedToOther = assignedToOthers.length > 0;

            return (
              <div
                key={model.id}
                className={classNames(
                  'border rounded-md p-3 transition-colors',
                  isAssignedToCurrent
                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20'
                    : 'bg-white dark:bg-gray-800',
                )}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* Left Info */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      setModelDetailsOpen(
                        modelDetailsOpen === model.id ? null : model.id,
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      {modelDetailsOpen === model.id ? (
                        <FaChevronUp className="text-xs" />
                      ) : (
                        <FaChevronDown className="text-xs" />
                      )}
                      <span
                        className={classNames(
                          'font-semibold',
                          isAssignedToCurrent
                            ? 'text-indigo-700 dark:text-indigo-400'
                            : 'text-gray-900 dark:text-gray-100',
                        )}
                      >
                        {model.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-5">
                      {model.brand?.name || '-'} - {model.type?.name || '-'}
                    </div>

                    {/* Status Chips */}
                    <div className="ml-5 mt-2 flex flex-wrap gap-2">
                      {isAssignedToCurrent && (
                        <Badge color="indigo" icon={FaCheck}>
                          Asignado aquí
                        </Badge>
                      )}
                      {isAssignedToOther &&
                        assignedToOthers.map((mv) => (
                          <Badge
                            key={mv.verticalId}
                            color="warning"
                            icon={FaExchangeAlt}
                          >
                            En: {mv.vertical?.name || 'Otra Vertical'}
                          </Badge>
                        ))}
                      <Badge color="gray">
                        {model.inventories?.length || model.inventoryCount || 0}{' '}
                        inventarios
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {isAssignedToCurrent ? (
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleUnassignClick(model)}
                      >
                        <FaTrashAlt className="mr-2" /> Desasignar
                      </Button>
                    ) : (
                      <Button
                        size="xs"
                        color="indigo"
                        onClick={() => handleAssign(model.id)}
                      >
                        <FaPlus className="mr-2" /> Asignar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expandable Inventories */}
                {modelDetailsOpen === model.id && (
                  <div className="mt-3 ml-5 max-h-60 overflow-y-auto space-y-2 border-t pt-2">
                    {(!model.inventories ||
                      model.inventories.length === 0 ||
                      !model.inventories[0].serialNumber) && (
                      <div className="text-xs text-gray-500 italic">
                        Detalles de inventario no disponibles en búsqueda
                        rápida.
                      </div>
                    )}

                    {model.inventories?.map((inv) =>
                      inv.serialNumber ? (
                        <div
                          key={inv.id}
                          className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-xs"
                        >
                          <div>
                            <span className="font-bold">
                              SN: {inv.serialNumber}
                            </span>
                            {inv.internalFolio && (
                              <span className="ml-2 text-gray-500">
                                Folio: {inv.internalFolio}
                              </span>
                            )}
                          </div>
                          <span
                            className={classNames(
                              'px-2 py-0.5 rounded text-[10px] font-bold',
                              getStatusColor(inv.status),
                            )}
                          >
                            {inv.status}
                          </span>
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmUnassign}
        onClose={() => setShowConfirmUnassign(false)}
        onConfirm={confirmUnassign}
        title="Desasignar Modelo"
        message={`¿Estás seguro de que deseas desasignar el modelo "${modelToUnassign?.name}" de esta vertical?`}
        confirmText="Desasignar"
        cancelText="Cancelar"
        confirmColor="red"
        isLoading={removeModel.isPending}
      />
    </div>
  );
};

export default VerticalModelsDetail;
