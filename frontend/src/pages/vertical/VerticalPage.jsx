// src/pages/VerticalPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaSitemap,
  FaPlus,
  FaTrash,
  FaEye,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa6';
import { BsThreeDots } from 'react-icons/bs';
import { FaBriefcase, FaEdit, FaFolder } from 'react-icons/fa';
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
import VerticalModelsDetail from '../../components/Verticals/VerticalModelsDetail';
import SideModal from '../../components/Modals/SideModal';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import Skeleton from 'react-loading-skeleton';
import { Dropdown } from 'flowbite-react';
import ActionButtons from '../../components/ActionButtons/ActionButtons';

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

  const [searchParams, setSearchParams] = useSearchParams();
  const modalId = searchParams.get('modalId');

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [verticalToDelete, setVerticalToDelete] = useState(null);

  // Abrir detalle de vertical si viene en URL
  useEffect(() => {
    if (modalId && verticales?.length) {
      // comparas string contra string
      const found = verticales.find((v) => v.id.toString() === modalId);
      if (found) setSelected(found);
    }
  }, [modalId, verticales]);

  // Mantener selected sincronizado si cambian datos
  useEffect(() => {
    if (selected?.id && verticales?.length) {
      const updated = verticales.find((v) => v.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [verticales]);

  const openDetailModal = (vertical) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('modalId', vertical.id);
      return params;
    });
    setSelected(vertical);
  };

  const closeDetailModal = () => {
    setSelected(null);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete('modalId');
      return params;
    });
    setShowFullDescription(false);
  };

  const handleEdit = (vertical) => {
    setEditData(vertical);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setVerticalToDelete(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    if (verticalToDelete) {
      deleteVertical.mutate(verticalToDelete, {
        onSuccess: () => {
          refetchVerticals();
          setShowConfirmDelete(false);
          setVerticalToDelete(null);
        },
      });
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
      <div className="flex gap-4">
        <span className="bg-sinabe-primary/10 text-sinabe-primary px-3 py-3 rounded-full text-sm flex items-center gap-2">
          <FaBriefcase size={20} /> {resumenGlobal.modelos} Modelos asignados
        </span>
        <span className="bg-sinabe-info/10 text-sinabe-info px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <FaFolder size={20} /> {resumenGlobal.inventarios} Inventarios
          relacionados
        </span>
      </div>

      {/* LISTADO DE VERTICALES */}
      {isLoading ? (
        <Skeleton count={6} height={80} />
      ) : verticales?.length ? (
        <div className="grid grid-cols-1 gap-4">
          {verticales.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm p-5 relative"
            >
              <div className="absolute top-4 right-4 text-nowrap">
                <Dropdown
                  inline
                  renderTrigger={() => (
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <BsThreeDots size={20} className="text-gray-500" />
                    </button>
                  )}
                >
                  <Dropdown.Item
                    icon={FaEye}
                    onClick={() => openDetailModal(v)}
                  >
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

              <h2 className="font-semibold text-base text-sinabe-blue-dark mb-1">
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

      {/* DETALLE DE VERTICAL */}
      <SideModal
        isOpen={!!selected}
        onClose={closeDetailModal}
        title={selected?.name}
        icon={FaSitemap}
        size="xl"
        className="mt-4 ml-4"
      >
        {selected && (
          <VerticalModelsDetail
            models={selected.models}
            verticalId={selected.id}
            removeModel={removeModel}
            refetchVerticals={refetchVerticals}
            showFullDescription={showFullDescription}
            setShowFullDescription={setShowFullDescription}
            shouldExpandInModal={shouldExpandInModal}
            selectedDescription={selected.description}
            showAssign={showAssign}
            setShowAssign={setShowAssign}
            assignModel={assignModel}
            searchModels={searchModels}
          />
        )}
      </SideModal>

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
            refetchVerticals();
          }}
        />
      )}

      {/* Modal de Confirmación para Eliminar */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setVerticalToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Vertical"
        message="¿Estás seguro de que deseas eliminar esta vertical? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmColor="red"
        isLoading={deleteVertical.isPending}
      />
    </div>
  );
};

export default VerticalPage;
