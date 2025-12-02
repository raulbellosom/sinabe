import React, { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaEdit, FaTrash, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import ReusableTable from '../../../components/Table/ReusableTable';
import ReusableModal from '../../../components/Modals/ReusableModal';
import ModalRemove from '../../../components/Modals/ModalRemove';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';
import LocationForm from '../../../components/Forms/LocationForm';
import Notifies from '../../../components/Notifies/Notifies';
import {
  getAllInventoryLocations,
  createInventoryLocation,
  updateInventoryLocation,
  deleteInventoryLocation,
} from '../../../services/inventoryLocationService';

const Locations = () => {
  const queryClient = useQueryClient();
  const formRef = useRef();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch locations
  const {
    data: locations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inventoryLocations'],
    queryFn: getAllInventoryLocations,
  });

  // Filter locations based on search term
  const filteredLocations = useMemo(() => {
    if (!searchTerm) return locations;
    return locations.filter((location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [locations, searchTerm]);

  // Client-side Pagination
  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLocations.slice(startIndex, startIndex + pageSize);
  }, [filteredLocations, currentPage, pageSize]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createInventoryLocation,
    onSuccess: () => {
      queryClient.invalidateQueries(['inventoryLocations']);
      Notifies('success', 'Ubicación creada exitosamente');
      handleCloseModal();
    },
    onError: (error) => {
      Notifies(
        'error',
        error.response?.data?.message || 'Error al crear la ubicación',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateInventoryLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventoryLocations']);
      Notifies('success', 'Ubicación actualizada exitosamente');
      handleCloseModal();
    },
    onError: (error) => {
      Notifies(
        'error',
        error.response?.data?.message || 'Error al actualizar la ubicación',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryLocation,
    onSuccess: () => {
      queryClient.invalidateQueries(['inventoryLocations']);
      Notifies('success', 'Ubicación eliminada exitosamente');
      handleCloseDeleteModal();
    },
    onError: (error) => {
      Notifies(
        'error',
        error.response?.data?.message || 'Error al eliminar la ubicación',
      );
    },
  });

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
  };

  const handleOpenDeleteModal = (location) => {
    setLocationToDelete(location);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLocationToDelete(null);
  };

  const handleSubmit = (values) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleConfirmDelete = () => {
    if (locationToDelete) {
      deleteMutation.mutate(locationToDelete.id);
    }
  };

  // Table Configuration
  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Ubicación', // Changed from label to title
        sortable: true,
        render: (value) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FaMapMarkerAlt className="text-purple-600 dark:text-purple-400 text-lg" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {value}
            </span>
          </div>
        ),
      },
      {
        key: 'count',
        title: 'Cantidad', // Changed from label to title
        sortable: true,
        render: (value, row) => (
          <Link
            to={`/inventories?locationName=${encodeURIComponent(row.name)}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-purple-100 hover:text-purple-800 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-purple-900/50 dark:hover:text-purple-300"
          >
            {value || 0} items
          </Link>
        ),
      },
      {
        key: 'actions',
        title: 'Acciones',
      },
    ],
    [],
  );

  const rowActions = (row) => [
    {
      key: 'main', // Set as main action
      label: 'Editar',
      icon: FaEdit,
      action: () => handleOpenEditModal(row),
      color: 'yellow',
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: FaTrash,
      action: () => handleOpenDeleteModal(row),
      color: 'red',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <FaMapMarkerAlt className="text-purple-600 dark:text-purple-400 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Ubicaciones
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona las ubicaciones de tu inventario
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ubicación..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <ActionButtons
              onCreate={handleOpenCreateModal}
              labelCreate="Nuevo"
              className="whitespace-nowrap"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <ReusableTable
          columns={columns}
          data={paginatedLocations}
          loading={isLoading}
          error={error}
          rowActions={rowActions}
          pagination={{
            currentPage: currentPage,
            totalPages: Math.ceil(filteredLocations.length / pageSize),
            totalRecords: filteredLocations.length,
            pageSize: pageSize,
          }}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          showPagination={true}
          rowClassName={() =>
            'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer'
          }
        />
      </div>

      {/* Create/Edit Modal */}
      <ReusableModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
        size="md"
        footer={
          <ActionButtons
            onCancel={handleCloseModal}
            labelCancel="Cancelar"
            extraActions={[
              {
                label: 'Guardar',
                action: () => formRef.current?.submitForm(),
                color: 'blue',
                filled: true,
              },
            ]}
          />
        }
      >
        <LocationForm
          ref={formRef}
          initialValues={editingLocation || { name: '' }}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </ReusableModal>

      {/* Delete Modal */}
      <ModalRemove
        isOpenModal={isDeleteModalOpen}
        onCloseModal={handleCloseDeleteModal}
        removeFunction={handleConfirmDelete}
      />
    </div>
  );
};

export default Locations;
