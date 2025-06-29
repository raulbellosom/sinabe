import React, { useState, useMemo, useEffect } from 'react';
import {
  FaSitemap,
  FaPlus,
  FaTrash,
  FaBriefcase,
  FaFolder,
  FaChevronDown,
  FaChevronUp,
  FaXmark,
  FaBoxOpen,
  FaEye,
} from 'react-icons/fa6';
import { BsThreeDots } from 'react-icons/bs';
import { FaEdit, FaRegTrashAlt } from 'react-icons/fa';
import {
  useVerticals,
  useCreateVertical,
  useUpdateVertical,
  useDeleteVertical,
  useAssignVerticalsToModel,
  useRemoveVerticalFromModel,
  useSearchModels,
} from '../../hooks/useVerticals';
import ModalVerticalForm from '../../components/Verticals/ModalVerticalForm';
import ModalAssignModel from '../../components/Verticals/ModalAssignModel';
import Skeleton from 'react-loading-skeleton';
import { Badge, Dropdown } from 'flowbite-react';
import { AnimatePresence, motion } from 'framer-motion';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import Notifies from '../../components/Notifies/Notifies';

const slideVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: 0.3 } },
  exit: { x: '100%', transition: { duration: 0.2 } },
};

const VerticalPage = () => {
  const {
    data: verticales,
    isLoading,
    refetch: refetchVerticals,
  } = useVerticals();

  const createVertical = useCreateVertical();
  const updateVertical = useUpdateVertical();
  const deleteVertical = useDeleteVertical();
  const assignModel = useAssignVerticalsToModel();
  const removeModel = useRemoveVerticalFromModel();
  const searchModels = useSearchModels();

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [modelDetailsOpen, setModelDetailsOpen] = useState(null);

  // 🔄 Cada vez que cambian las verticales, re-sincroniza el 'selected'
  useEffect(() => {
    if (selected?.id) {
      const updated = verticales?.find((v) => v.id === selected.id);
      if (updated) {
        setSelected(updated);
      }
    }
  }, [verticales]);

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
      verticales?.reduce((sum, v) => sum + (v.models?.length || 0), 0) || 0;
    const inventarios =
      verticales?.reduce(
        (sum, v) => sum + (v.models?.flatMap((m) => m.inventories).length || 0),
        0,
      ) || 0;
    return { modelos, inventarios };
  }, [verticales]);

  const shouldCollapse = (text) =>
    text?.split('\n').length > 3 || text?.length > 200;
  const shouldExpandInModal = (text) => text?.split('\n').length > 5;

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

  return (
    <div className="p-4 space-y-6 bg-white dark:bg-gray-900 rounded-lg shadow-md h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-sinabe-primary flex items-center gap-2">
          <FaSitemap /> Verticales
        </h1>
        <div>
          <ActionButtons
            extraActions={[
              {
                label: 'Nueva Vertical',
                icon: FaPlus,
                color: 'indigo',
                filled: true,
                action: () => {
                  setEditData(null);
                  setShowForm(true);
                },
              },
            ]}
          />
        </div>
      </div>

      {/* RESUMEN GLOBAL */}
      <div className="flex flex-col md:flex-row gap-4">
        <span className="bg-sinabe-primary/10 text-sinabe-primary px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <FaBriefcase /> {resumenGlobal.modelos} Modelos asignados
        </span>
        <span className="bg-sinabe-info/10 text-sinabe-info px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <FaFolder /> {resumenGlobal.inventarios} Inventarios relacionados
        </span>
      </div>

      {/* LISTADO DE VERTICALES */}
      {isLoading ? (
        <Skeleton count={6} height={80} />
      ) : verticales?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {verticales.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm p-5 relative text-nowrap"
            >
              <div className="absolute top-4 right-4">
                <Dropdown
                  inline
                  renderTrigger={() => (
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <BsThreeDots size={20} className="text-gray-500" />
                    </button>
                  )}
                >
                  <Dropdown.Item icon={FaEye} onClick={() => setSelected(v)}>
                    Administrar inventarios
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

              <h2 className="font-semibold text-sm lg:text-base text-sinabe-blue-dark mb-1">
                {v.name}
              </h2>
              <div className="text-xs lg:text-sm text-gray-600 mb-3 whitespace-pre-line">
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
          <FaSitemap className="text-5xl mb-4 mx-auto" />
          <h2 className="text-xl font-semibold">
            No hay verticales registradas
          </h2>
          <p className="text-sm">Haz clic en "Nueva Vertical" para comenzar.</p>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      <AnimatePresence>
        {selected && (
          <div
            style={{
              margin: 0,
              paddingTop: '10px',
              paddingLeft: '10px',
            }}
            className="fixed inset-0 bg-black/50 z-50 flex justify-end m-0"
          >
            <motion.div
              key="modal"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={slideVariants}
              className="w-full max-w-[95%] md:max-w-2xl 2xl:max-w-3xl h-full bg-white dark:bg-gray-900 shadow-lg py-6 px-4 overflow-y-auto rounded-tl-3xl relative"
            >
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
                {showFullDescription ||
                !shouldExpandInModal(selected.description)
                  ? selected.description
                  : selected.description.split('\n').slice(0, 5).join('\n') +
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
                        className="flex justify-between items-start cursor-pointer"
                        onClick={() =>
                          setModelDetailsOpen(
                            modelDetailsOpen === model.id ? null : model.id,
                          )
                        }
                      >
                        <div className="flex items-center w-full">
                          <div className="flex flex-col items-start gap-2 font-medium text-sm">
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-gray-500 hover:text-sinabe-primary cursor-pointer p-2 hover:bg-gray-100 rounded">
                                {modelDetailsOpen === model.id ? (
                                  <FaChevronUp className="text-xs" />
                                ) : (
                                  <FaChevronDown className="text-xs" />
                                )}
                              </span>
                              <p className="text-sinabe-primary font-semibold">
                                {model.name} ({model.brand?.name || '-'} -{' '}
                                {model.type?.name || '-'})
                              </p>
                            </div>
                            <Badge size="sm" color="indigo" className="text-xs">
                              {model.inventories?.length || 0} inventarios
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div>
                            <ActionButtons
                              extraActions={[
                                {
                                  label: 'Desasignar',
                                  icon: FaRegTrashAlt,
                                  color: 'red',
                                  action: async (e) => {
                                    e.stopPropagation();
                                    await removeModel.mutateAsync({
                                      modelId: model.id,
                                      verticalId: selected.id,
                                    });
                                    await refetchVerticals();
                                    Notifies(
                                      'success',
                                      'Modelo desasignado correctamente',
                                    );
                                  },
                                },
                              ]}
                            />
                          </div>
                        </div>
                      </div>

                      {modelDetailsOpen === model.id && (
                        <div className="mt-2 max-h-96 overflow-y-auto space-y-2">
                          {model.inventories.map((inv) => (
                            <div
                              key={inv.id}
                              className="flex justify-between bg-sinabe-gray/10 border rounded-md p-2 text-sm"
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
                              <div
                                className={`flex items-center h-fit text-xs px-2 py-0.5 rounded-full ${getStatusColor(inv.status)}`}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALES DE CREAR / ASIGNAR */}
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
          loadModels={(term) => searchModels(term, selected?.id)}
        />
      )}
    </div>
  );
};

export default VerticalPage;
