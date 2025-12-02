import React, { useEffect, useState, useMemo } from 'react';
import { useCatalogContext } from '../../../context/CatalogContext';
import ModalRemove from '../../../components/Modals/ModalRemove';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import { ConditionFormSchema } from '../../../components/InventoryComponents/ConditionForm/ConditionFormSchema';
import ConditionFormFields from '../../../components/InventoryComponents/ConditionForm/ConditionFormFields';
import { FaListAlt, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import ReusableTable from '../../../components/Table/ReusableTable';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';

const Conditions = () => {
  const {
    inventoryConditions,
    createInventoryCondition,
    updateInventoryCondition,
    deleteInventoryCondition,
    loading,
  } = useCatalogContext();
  const [conditions, setConditions] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removeConditionId, setRemoveConditionId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: '',
    id: '',
    count: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const formattedConditions = inventoryConditions.map((condition) => {
      return {
        id: condition.id,
        name: condition.name,
        count: condition.count,
      };
    });
    formattedConditions.sort((a, b) => a.name.localeCompare(b.name));
    setConditions(formattedConditions);
  }, [inventoryConditions]);

  const filteredConditions = useMemo(() => {
    if (!searchTerm) return conditions;
    return conditions.filter((condition) =>
      condition.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [conditions, searchTerm]);

  // Client-side Pagination
  const paginatedConditions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredConditions.slice(startIndex, startIndex + pageSize);
  }, [filteredConditions, currentPage, pageSize]);

  const onEditCondition = (condition) => {
    setEditMode(true);
    setInitialValues({
      id: condition.id,
      name: condition.name,
      count: condition.count,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateInventoryCondition(values)
        : await createInventoryCondition(values);
      setSubmitting(false);
      resetForm();
      setInitialValues({
        name: '',
        id: '',
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
      await deleteInventoryCondition(removeConditionId);
      setIsDeleteModalOpen(false);
      setRemoveConditionId(null);
    } catch (error) {
      console.log(error);
      setIsDeleteModalOpen(false);
    }
  };

  const onCloseModal = () => {
    setEditMode(false);
    setInitialValues({
      name: '',
      id: '',
      count: 0,
    });
    setIsOpenModal(false);
  };

  const onRemoveCondition = (id) => {
    setRemoveConditionId(id);
    setIsDeleteModalOpen(true);
  };

  const isCreatePermission = useCheckPermissions(
    'create_inventories_conditions',
  );
  const isEditPermission = useCheckPermissions('edit_inventories_conditions');
  const isDeletePermission = useCheckPermissions(
    'delete_inventories_conditions',
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Condición', // Changed from label to title
        sortable: true,
        render: (value) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FaListAlt className="text-orange-600 dark:text-orange-400 text-lg" />
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
            to={`/inventories?conditionName=${encodeURIComponent(row.name)}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-orange-100 hover:text-orange-800 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-orange-900/50 dark:hover:text-orange-300"
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
        action: () => onEditCondition(row),
        color: 'yellow',
      });
    }
    if (isDeletePermission.hasPermission) {
      actions.push({
        key: 'delete',
        label: 'Eliminar',
        icon: FaTrash,
        action: () => onRemoveCondition(row.id),
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
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <FaListAlt className="text-orange-600 dark:text-orange-400 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Condiciones
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Define el estado físico de tus inventarios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar condición..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            {isCreatePermission.hasPermission && (
              <ActionButtons
                onCreate={() => setIsOpenModal(true)}
                labelCreate="Nueva"
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
          data={paginatedConditions}
          loading={loading}
          rowActions={rowActions}
          pagination={{
            currentPage: currentPage,
            totalPages: Math.ceil(filteredConditions.length / pageSize),
            totalRecords: filteredConditions.length,
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
        title={editMode ? 'Editar Condición' : 'Nueva Condición'}
        schema={ConditionFormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        formFields={<ConditionFormFields />}
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

export default Conditions;
