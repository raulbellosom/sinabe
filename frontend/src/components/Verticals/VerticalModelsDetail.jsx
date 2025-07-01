import React, { useState } from 'react';
import { Badge, Button, Modal } from 'flowbite-react';
import {
  FaChevronDown,
  FaChevronUp,
  FaRegTrashAlt,
  FaPlus,
} from 'react-icons/fa';
import classNames from 'classnames';
import ActionButtons from '../ActionButtons/ActionButtons';
import Notifies from '../Notifies/Notifies';
import ModalAssignModel from './ModalAssignModel'; // Ajusta la ruta si es necesario

const ConfirmUnassignModelModal = ({
  show,
  modelName,
  onConfirm,
  onCancel,
}) => (
  <Modal show={show} size="sm" onClose={onCancel}>
    <Modal.Header>Confirmar desasignación</Modal.Header>
    <Modal.Body>
      <p>
        ¿Seguro que deseas desasignar <strong>{modelName}</strong> de esta
        vertical?
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Button color="gray" onClick={onCancel}>
        Cancelar
      </Button>
      <Button color="red" onClick={onConfirm}>
        Desasignar
      </Button>
    </Modal.Footer>
  </Modal>
);

const VerticalModelsDetail = ({
  models = [],
  verticalId,
  removeModel,
  refetchVerticals,
  showFullDescription,
  setShowFullDescription,
  shouldExpandInModal,
  selectedDescription,
  showAssign,
  setShowAssign,
  assignModel,
  searchModels,
}) => {
  const [modelDetailsOpen, setModelDetailsOpen] = useState(null);
  const [confirmUnassignModel, setConfirmUnassignModel] = useState(false);
  const [modelToUnassign, setModelToUnassign] = useState(null);

  const handleUnassignInitiate = (model) => {
    setModelToUnassign(model);
    setConfirmUnassignModel(true);
  };

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

  const handleConfirmUnassign = async () => {
    if (modelToUnassign) {
      await removeModel.mutateAsync(
        { modelId: modelToUnassign.id, verticalId },
        {
          onSuccess: async () => {
            await refetchVerticals();
            Notifies('success', 'Modelo desasignado correctamente');
            setConfirmUnassignModel(false);
            setModelDetailsOpen(null);
          },
        },
      );
    }
  };

  return (
    <>
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Modelos asignados</h3>
        <div>
          <ActionButtons
            extraActions={[
              {
                label: 'Asignar modelo',
                icon: FaPlus,
                color: 'indigo',
                filled: true,
                action: () => setShowAssign(true),
              },
            ]}
          />
        </div>
      </div>
      {models.length === 0 ? (
        <div className="text-center text-gray-500 mb-6 text-sm">
          No hay modelos asignados.
        </div>
      ) : (
        <div className="space-y-4 h-full overflow-y-auto">
          {models.map((model) => (
            <div key={model.id} className="border rounded-md p-3">
              <div
                className="flex flex-col-reverse gap-2 md:flex-row justify-between items-start cursor-pointer"
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
                  <span className="text-sinabe-primary font-semibold">
                    {model.name} ({model.brand?.name || '-'} -{' '}
                    {model.type?.name || '-'})
                  </span>
                </div>
                <div className="flex items-center justify-between md:justify-end w-full gap-2">
                  <Badge
                    size="sm"
                    color="indigo"
                    className="text-xs text-nowrap"
                  >
                    {model.inventories?.length || 0} inventarios
                  </Badge>
                  <div>
                    <ActionButtons
                      extraActions={[
                        {
                          label: 'Desasignar',
                          icon: FaRegTrashAlt,
                          color: 'red',
                          action: (e) => {
                            e.stopPropagation();
                            handleUnassignInitiate(model);
                          },
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
              {modelDetailsOpen === model.id && (
                <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                  {model.inventories.map((inv) => (
                    <div
                      key={inv.id}
                      className={classNames(
                        'flex justify-between items-center border rounded-md p-2 text-sm',
                      )}
                    >
                      <div>
                        <div className="font-semibold">
                          SN: {inv.serialNumber || 'Inventario'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Tipo: {model.type?.name || '-'} | Marca:{' '}
                          {model.brand?.name || '-'} | # Activo:{' '}
                          {inv.activeNumber || '-'} | Folio:{' '}
                          {inv.internalFolio || '-'}
                        </div>
                      </div>
                      <span
                        className={classNames(
                          'mt-1 px-2 py-1 rounded text-xs font-semibold',
                          getStatusColor(inv.status),
                        )}
                      >
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ConfirmUnassignModelModal
        show={confirmUnassignModel}
        modelName={`Modelo ${modelToUnassign?.name} (${modelToUnassign?.brand?.name || '-'} - ${modelToUnassign?.type?.name || '-'})`}
        onConfirm={handleConfirmUnassign}
        onCancel={() => setConfirmUnassignModel(false)}
      />
      {showAssign && (
        <ModalAssignModel
          isOpen={showAssign}
          onClose={() => setShowAssign(false)}
          verticalId={verticalId}
          onAssign={({ modelId, verticalId }) => {
            assignModel.mutate(
              { modelId, verticalIds: [verticalId] },
              {
                onSuccess: async () => {
                  await refetchVerticals();
                  setShowAssign(false);
                },
              },
            );
          }}
          loadModels={(term) => searchModels(term, verticalId)}
        />
      )}
    </>
  );
};

export default VerticalModelsDetail;
