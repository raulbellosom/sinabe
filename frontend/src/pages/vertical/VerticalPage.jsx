// src/pages/VerticalPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaSitemap,
  FaPlus,
  FaSearch,
  FaChevronRight,
  FaChevronLeft,
} from 'react-icons/fa';
import { TextInput } from 'flowbite-react';
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
import VerticalDetailExtended from '../../components/Verticals/VerticalDetailExtended';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import Skeleton from 'react-loading-skeleton';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import classNames from 'classnames';
import MaintenanceAgendaGlobal from '../../components/Verticals/MaintenanceAgendaGlobal';

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
  const urlVerticalId = searchParams.get('verticalId');

  const [currentTab, setCurrentTab] = useState('verticals'); // 'verticals' | 'agenda'
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [verticalToDelete, setVerticalToDelete] = useState(null);

  // Sync selection with URL or List updates
  useEffect(() => {
    if (verticales?.length) {
      if (urlVerticalId) {
        const found = verticales.find((v) => v.id.toString() === urlVerticalId);
        if (found) setSelected(found);
      }
    }
  }, [urlVerticalId, verticales]);

  // Keep selected object fresh
  useEffect(() => {
    if (selected?.id && verticales?.length) {
      const updated = verticales.find((v) => v.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [verticales]);

  const handleSelect = (vertical) => {
    setSelected(vertical);
    setShowFullDescription(false);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('verticalId', vertical.id);
      return params;
    });
  };

  const handleEdit = (vertical) => {
    setEditData(vertical);
    setShowForm(true);
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
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
          if (selected?.id === verticalToDelete) {
            setSelected(null);
            setSearchParams((prev) => {
              const params = new URLSearchParams(prev);
              params.delete('verticalId');
              return params;
            });
          }
        },
      });
    }
  };

  const shouldExpandInModal = (text) =>
    text?.split('\n').length > 5 || text?.length > 200;

  const filteredVerticals =
    verticales?.filter((v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* HEADER */}
      {/* HEADER */}
      <div className="flex-none p-4 bg-white dark:bg-gray-800 shadow-sm border-b flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <h1 className="text-xl font-bold text-sinabe-primary flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
          <FaSitemap className="flex-shrink-0 text-2xl md:text-xl" />{' '}
          <span className="truncate">Gestión de Verticales</span>
        </h1>
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end overflow-x-auto">
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 flex-shrink-0">
            <button
              onClick={() => setCurrentTab('verticals')}
              className={classNames(
                'px-4 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap',
                currentTab === 'verticals'
                  ? 'bg-white dark:bg-gray-600 shadow text-sinabe-primary'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              Verticales
            </button>
            <button
              onClick={() => setCurrentTab('agenda')}
              className={classNames(
                'px-4 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all whitespace-nowrap',
                currentTab === 'agenda'
                  ? 'bg-white dark:bg-gray-600 shadow text-sinabe-primary'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              Agenda
            </button>
          </div>

          {currentTab === 'verticals' && (
            <div className="flex-shrink-0">
              <ActionButtons
                extraActions={[
                  {
                    label: 'Nueva',
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
          )}
        </div>
      </div>

      {/* CONTENT SWITCHER */}
      {currentTab === 'agenda' ? (
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 m-4 rounded-lg shadow">
          <MaintenanceAgendaGlobal />
        </div>
      ) : (
        /* SPLIT VIEW */
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL: LIST */}
          <div
            className={classNames(
              'w-full md:w-1/3 min-w-[300px] max-w-[400px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col',
              selected ? 'hidden md:flex' : 'flex',
            )}
          >
            <div className="p-4 border-b">
              <TextInput
                icon={FaSearch}
                placeholder="Buscar vertical..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4">
                  <Skeleton count={5} height={60} />
                </div>
              ) : filteredVerticals.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron verticales.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredVerticals.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => handleSelect(v)}
                      className={classNames(
                        'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-center group',
                        selected?.id === v.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                          : 'border-l-4 border-transparent',
                      )}
                    >
                      <div>
                        <h3
                          className={classNames(
                            'font-medium',
                            selected?.id === v.id
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-gray-800 dark:text-gray-200',
                          )}
                        >
                          {v.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {v.models?.length || 0} modelos
                        </p>
                      </div>
                      <FaChevronRight
                        className={classNames(
                          'text-gray-300',
                          selected?.id === v.id && 'text-indigo-500',
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: DETAILS */}
          <div
            className={classNames(
              'flex-1 bg-white dark:bg-gray-900 p-6 overflow-hidden flex flex-col',
              !selected ? 'hidden md:flex' : 'flex',
            )}
          >
            {selected ? (
              <>
                {/* Mobile Back Button */}
                <button
                  onClick={() => {
                    setSelected(null);
                    setSearchParams((prev) => {
                      const params = new URLSearchParams(prev);
                      params.delete('verticalId');
                      return params;
                    });
                  }}
                  className="md:hidden mb-4 flex items-center text-gray-600 hover:text-indigo-600 font-medium"
                >
                  <FaChevronLeft className="mr-2" />
                  Volver a la lista
                </button>

                <VerticalDetailExtended
                  vertical={selected}
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
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FaSitemap className="text-6xl mb-4 opacity-20" />
                <p className="text-lg">
                  Selecciona una vertical para ver sus detalles
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALES */}
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
