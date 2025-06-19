import React, { useState, useMemo } from 'react';
import {
  FaSitemap,
  FaPlus,
  FaEye,
  FaTrash,
  FaBriefcase,
  FaFolder,
  FaChevronDown,
  FaChevronUp,
  FaXmark,
  FaBoxOpen,
} from 'react-icons/fa6';
import {
  useVerticals,
  useCreateVertical,
  useUpdateVertical,
  useDeleteVertical,
  useAssignVerticalsToModel,
  useRemoveVerticalFromModel,
} from '../../hooks/useVerticals';
import ModalVerticalForm from '../../components/Verticals/ModalVerticalForm';
import ModalAssignModel from '../../components/Verticals/ModalAssignModel';
import Skeleton from 'react-loading-skeleton';
import { Dropdown } from 'flowbite-react';
import { BsThreeDots } from 'react-icons/bs';
import { FaEdit, FaRegTrashAlt } from 'react-icons/fa';
import api from '../../services/api';

const VerticalPage = () => {
  const { data: verticales, isLoading } = useVerticals();
  const createVertical = useCreateVertical();
  const updateVertical = useUpdateVertical();
  const deleteVertical = useDeleteVertical();
  const assignModel = useAssignVerticalsToModel();
  const removeModel = useRemoveVerticalFromModel();
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [modelDetailsOpen, setModelDetailsOpen] = useState(null);

  const handleEdit = (vertical) => {
    setEditData(vertical);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de eliminar esta vertical?')) {
      deleteVertical.mutate(id);
    }
  };

  const resumenGlobal = useMemo(() => {
    const modelos =
      verticales?.reduce((acc, v) => acc + (v.models?.length || 0), 0) || 0;
    const inventarios =
      verticales?.reduce(
        (acc, v) => acc + (v.models?.flatMap((m) => m.inventories).length || 0),
        0,
      ) || 0;
    return { modelos, inventarios };
  }, [verticales]);

  const shouldCollapse = (text) =>
    text?.split('\n').length > 3 || text?.length > 200;
  const shouldExpandInModal = (text) => text?.split('\n').length > 5;

  const searchModels = async (query) => {
    const response = await api.get('/inventories/inventoryModels/search', {
      params: { searchTerm: query, page: 1, pageSize: 10 },
    });

    return response.data.data.map((model) => ({
      value: model.id,
      label: `${model.name} (${model.brand.name} - ${model.type.name})`,
    }));
  };

  const refreshSelectedFromList = (verticalId) => {
    const updated = verticales?.find((v) => v.id === verticalId);
    if (updated) setSelected(updated);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Alta':
        return 'bg-green-100 text-green-800';
      case 'Baja':
        return 'bg-red-100 text-red-800';
      case 'Propuesta':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-lg shadow-md h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sinabe-primary flex items-center gap-2">
          <FaSitemap /> Verticales
        </h1>
        <button
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }}
          className="bg-sinabe-primary hover:bg-sinabe-primary/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FaPlus /> Nueva Vertical
        </button>
      </div>

      <div className="flex gap-4">
        <span className="bg-sinabe-secondary/10 text-sinabe-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <FaBriefcase /> {resumenGlobal.modelos} Modelos asignados
        </span>
        <span className="bg-sinabe-info/10 text-sinabe-info px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <FaFolder /> {resumenGlobal.inventarios} Inventarios relacionados
        </span>
      </div>

      {isLoading ? (
        <Skeleton count={6} height={80} />
      ) : verticales && verticales.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {verticales.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm p-5 relative"
            >
              <div className="absolute top-4 right-4">
                <Dropdown
                  inline
                  renderTrigger={() => (
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <BsThreeDots size={20} className="text-gray-500" />
                    </button>
                  )}
                  className="min-w-max text-nowrap"
                >
                  <Dropdown.Item icon={FaEye} onClick={() => setSelected(v)}>
                    Ver detalles
                  </Dropdown.Item>
                  <Dropdown.Item icon={FaEdit} onClick={() => handleEdit(v)}>
                    Editar
                  </Dropdown.Item>
                  <Dropdown.Item
                    icon={FaTrash}
                    className="text-red-500"
                    onClick={() => handleDelete(v.id)}
                  >
                    Eliminar
                  </Dropdown.Item>
                </Dropdown>
              </div>
              <h2 className="font-semibold text-lg text-sinabe-blue-dark mb-1">
                {v.name}
              </h2>
              <div className="text-sm text-gray-600 mb-3 whitespace-pre-line">
                {expanded === v.id ? (
                  <>
                    <p className="mb-1">{v.description}</p>
                    <button
                      onClick={() => setExpanded(null)}
                      className="text-xs text-sinabe-primary hover:underline flex items-center gap-1"
                    >
                      Ver menos <FaChevronUp className="text-xs" />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="line-clamp-2">{v.description}</p>
                    {shouldCollapse(v.description) && (
                      <button
                        onClick={() => setExpanded(v.id)}
                        className="text-xs text-sinabe-primary hover:underline flex items-center gap-1"
                      >
                        Ver más <FaChevronDown className="text-xs" />
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FaBriefcase /> {v.models?.length || 0} modelos
                </span>
                <span className="flex items-center gap-1">
                  <FaFolder />{' '}
                  {v.models?.flatMap((m) => m.inventories).length || 0}{' '}
                  inventarios
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-20 text-gray-500">
          <div className="text-5xl mb-4 flex justify-center">
            <FaSitemap />
          </div>
          <h2 className="text-xl font-semibold">
            No hay verticales registradas
          </h2>
          <p className="text-sm">Haz clic en "Nueva Vertical" para comenzar.</p>
        </div>
      )}

      {selected && (
        <div
          style={{ margin: '0' }}
          className="fixed inset-0 bg-black/50 z-50 flex justify-end"
        >
          <div className="w-full h-full bg-white dark:bg-gray-900 shadow-lg p-6 overflow-y-auto rounded-l-2xl max-w-4xl">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
              <FaXmark />
            </button>
            <h2 className="text-xl font-bold mb-2 text-sinabe-primary flex items-center gap-2">
              <FaSitemap /> {selected.name}
            </h2>
            <p className="text-sm text-gray-600 whitespace-pre-line mb-2">
              {showFullDescription || !shouldExpandInModal(selected.description)
                ? selected.description
                : selected.description?.split('\n').slice(0, 5).join('\n') +
                  '...'}
            </p>
            {shouldExpandInModal(selected.description) && (
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
              <button
                onClick={() => setShowAssign(true)}
                className="text-sm bg-sinabe-success text-white px-3 py-1 rounded hover:bg-sinabe-success/90"
              >
                Asignar modelo
              </button>
            </div>

            {selected.models.length === 0 ? (
              <div className="text-center text-gray-500 mb-6 text-sm">
                <FaBoxOpen className="mx-auto text-2xl mb-2" />
                No hay modelos asignados.
              </div>
            ) : (
              <div className="space-y-4">
                {selected.models.map((model) => (
                  <div key={model.id} className="border rounded-md p-3">
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() =>
                        setModelDetailsOpen(
                          modelDetailsOpen === model.id ? null : model.id,
                        )
                      }
                    >
                      <div className="flex items-center gap-2 font-medium text-sm">
                        {model.name} ({model.brand?.name || '-'} -{' '}
                        {model.type?.name || '-'})
                        <span className="text-xs bg-sinabe-primary text-white rounded-full px-2 py-0.5">
                          {model.inventories?.length || 0} inventarios
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-gray-500 hover:text-sinabe-primary cursor-pointer p-2 hover:bg-gray-100 rounded">
                          {modelDetailsOpen === model.id ? (
                            <FaChevronUp className="text-xs" />
                          ) : (
                            <FaChevronDown className="text-xs" />
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeModel.mutate({
                              modelId: model.id,
                              verticalId: selected.id,
                            });
                          }}
                          className="text-xs text-red-500 hover:bg-red-100 rounded p-2"
                        >
                          <FaRegTrashAlt className="inline-block mr-1" />
                          Desasignar
                        </button>
                      </div>
                    </div>

                    {modelDetailsOpen === model.id && (
                      <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
                        {model.inventories.map((inv) => (
                          <div
                            key={inv.id}
                            className="bg-sinabe-gray/10 border rounded-md p-2 text-sm"
                          >
                            <div className="font-semibold">
                              {inv.serialNumber ||
                                inv.activeNumber ||
                                'Inventario'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Modelo: {model.name} | Tipo:{' '}
                              {model.type?.name || '-'} | Marca:{' '}
                              {model.brand?.name || '-'}
                            </div>
                            <div
                              className={`mt-1 text-xs inline-block px-2 py-0.5 rounded-full ${getStatusColor(inv.status)}`}
                            >
                              {inv.status || 'Sin estado'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <ModalVerticalForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          initialData={editData}
          onSubmit={async (data) => {
            if (editData) {
              await updateVertical.mutateAsync({ id: editData.id, data });
            } else {
              await createVertical.mutateAsync(data);
            }
            setShowForm(false);
          }}
        />
      )}

      {showAssign && selected && (
        <ModalAssignModel
          isOpen={showAssign}
          onClose={() => setShowAssign(false)}
          verticalId={selected.id}
          onAssign={async ({ modelId, verticalId }) => {
            await assignModel.mutateAsync({
              modelId,
              verticalIds: [verticalId],
            });
            refreshSelectedFromList(verticalId); // ⬅️ actualiza el modal desde la lista ya cargada
            setShowAssign(false);
          }}
          loadModels={searchModels}
        />
      )}
    </div>
  );
};

export default VerticalPage;
