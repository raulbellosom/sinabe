import React, { useEffect, useState, useMemo } from 'react';
import { useCatalogContext } from '../../../context/CatalogContext';
import ModalRemove from '../../../components/Modals/ModalRemove';
import TypeFormFields from '../../../components/InventoryComponents/TypeForm/TypeFormFields';
import { TypeFormSchema } from '../../../components/InventoryComponents/TypeForm/TypeFormSchema';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import { BiCategory } from 'react-icons/bi';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import ReusableTable from '../../../components/Table/ReusableTable';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';

const Types = () => {
  const {
    inventoryTypes,
    createInventoryType,
    updateInventoryType,
    deleteInventoryType,
    loading,
  } = useCatalogContext();
  const [types, setTypes] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removeTypeId, setRemoveTypeId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    id: '',
    name: '',
    count: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const formattedTypes = inventoryTypes.map((type) => {
      return {
        id: type?.id,
        name: type?.name,
        count: type?.count,
      };
    });
    formattedTypes.sort((a, b) =>
      a?.name?.toLowerCase().localeCompare(b?.name?.toLowerCase()),
    );
    setTypes(formattedTypes);
  }, [inventoryTypes]);

  const filteredTypes = useMemo(() => {
    if (!searchTerm) return types;
    return types.filter((type) =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [types, searchTerm]);

  // Client-side Pagination
  const paginatedTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTypes.slice(startIndex, startIndex + pageSize);
  }, [filteredTypes, currentPage, pageSize]);

  const onEditType = (type) => {
    setEditMode(true);
    let selectedType = inventoryTypes.find((t) => t.id === type.id);
    setInitialValues({
      id: selectedType?.id,
      name: selectedType?.name,
      count: selectedType?.count,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateInventoryType(values)
        : await createInventoryType(values);
      setSubmitting(false);
      resetForm();
      setInitialValues({
        id: '',
        name: '',
        count: 0,
      });
      setIsOpenModal(false);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInventoryType(removeTypeId);
      setIsDeleteModalOpen(false);
      setRemoveTypeId(null);
    } catch (error) {
      console.log(error);
      setIsDeleteModalOpen(false);
    }
  };

  const onCloseModal = () => {
    setEditMode(false);
    setInitialValues({
      id: '',
      name: '',
      count: 0,
    });
    setIsOpenModal(false);
  };

  const onRemoveType = (id) => {
    setRemoveTypeId(id);
    setIsDeleteModalOpen(true);
  };

  const isCreatePermission = useCheckPermissions('create_inventories_types');
  const isEditPermission = useCheckPermissions('edit_inventories_types');
  const isDeletePermission = useCheckPermissions('delete_inventories_types');

  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Tipo', // Changed from label to title
        sortable: true,
        render: (value) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <BiCategory className="text-amber-600 dark:text-amber-400 text-lg" />
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
            to={`/inventories?typeName=${encodeURIComponent(row.name)}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-amber-100 hover:text-amber-800 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-amber-900/50 dark:hover:text-amber-300"
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

  const rowActions = (row) => {
    const actions = [];
    if (isEditPermission.hasPermission) {
      actions.push({
        key: 'main', // Set as main action
        label: 'Editar',
        icon: FaEdit,
        action: () => onEditType(row),
        color: 'yellow',
      });
    }
    if (isDeletePermission.hasPermission) {
      actions.push({
        key: 'delete',
        label: 'Eliminar',
        icon: FaTrash,
        action: () => onRemoveType(row.id),
        color: 'red',
      });
    }
    return actions;
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      {/* Header Section */}
      <div className="p-4 pt-0 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <BiCategory className="text-amber-600 dark:text-amber-400 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Tipos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clasifica tus inventarios por tipo
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tipo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            {isCreatePermission.hasPermission && (
              <ActionButtons
                onCreate={() => setIsOpenModal(true)}
                labelCreate="Nuevo"
                className="whitespace-nowrap"
              />
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <ReusableTable
          columns={columns}
          data={paginatedTypes}
          loading={loading}
          rowActions={rowActions}
          pagination={{
            currentPage: currentPage,
            totalPages: Math.ceil(filteredTypes.length / pageSize),
            totalRecords: filteredTypes.length,
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

      <ModalFormikForm
        onClose={onCloseModal}
        isOpenModal={isOpenModal}
        title={editMode ? 'Editar Tipo' : 'Nuevo Tipo'}
        schema={TypeFormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        formFields={<TypeFormFields />}
        saveLabel={editMode ? 'Actualizar' : 'Guardar'}
      />

      <ModalRemove
        isOpenModal={isDeleteModalOpen}
        onCloseModal={() => setIsDeleteModalOpen(false)}
        removeFunction={handleDelete}
      />
    </div>
  );
};

export default Types;
