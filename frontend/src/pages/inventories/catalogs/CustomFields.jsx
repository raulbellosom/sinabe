import React, { useEffect, useState, useMemo } from 'react';
import ModalRemove from '../../../components/Modals/ModalRemove';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import { useCustomFieldContext } from '../../../context/CustomFieldContext';
import { CustomFieldFormSchema } from '../../../components/InventoryComponents/CustomField/CustomFieldFormSchema';
import CustomFieldFields from '../../../components/InventoryComponents/CustomField/CustomFieldFields';
import { RiInputField } from 'react-icons/ri';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import ReusableTable from '../../../components/Table/ReusableTable';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';

const InitValues = {
  name: '',
  id: '',
};

const CustomFields = () => {
  const {
    customFields,
    isLoadingCustomFields,
    createField,
    updateField,
    deleteField,
  } = useCustomFieldContext();
  const [cFields, setCFields] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removeCField, setRemoveCField] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState(InitValues);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const formattedCFields = customFields.map((condition) => {
      return {
        id: condition.id,
        name: condition.name,
      };
    });
    formattedCFields.sort((a, b) => a.name.localeCompare(b.name));
    setCFields(formattedCFields);
  }, [customFields]);

  const filteredFields = useMemo(() => {
    if (!searchTerm) return cFields;
    return cFields.filter((field) =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [cFields, searchTerm]);

  // Client-side Pagination
  const paginatedFields = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFields.slice(startIndex, startIndex + pageSize);
  }, [filteredFields, currentPage, pageSize]);

  const onEditCondition = (condition) => {
    setEditMode(true);
    setInitialValues({
      id: condition.id,
      name: condition.name,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode ? await updateField(values) : await createField(values);
      setSubmitting(false);
      resetForm();
      setInitialValues(InitValues);
      setIsOpenModal(false);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteField(removeCField);
      setIsDeleteModalOpen(false);
      setRemoveCField(null);
    } catch (error) {
      console.log(error);
      setIsDeleteModalOpen(false);
    }
  };

  const onCloseModal = () => {
    setEditMode(false);
    setInitialValues(InitValues);
    setIsOpenModal(false);
  };

  const onRemoveCondition = (id) => {
    setRemoveCField(id);
    setIsDeleteModalOpen(true);
  };

  const isCreatePermission = useCheckPermissions(
    'create_inventories_custom_fields',
  );
  const isEditPermission = useCheckPermissions(
    'edit_inventories_custom_fields',
  );
  const isDeletePermission = useCheckPermissions(
    'delete_inventories_custom_fields',
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Nombre del Campo', // Changed from label to title
        sortable: true,
        render: (value) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <RiInputField className="text-teal-600 dark:text-teal-400 text-lg" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {value}
            </span>
          </div>
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
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <RiInputField className="text-teal-600 dark:text-teal-400 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Campos Personalizados
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Agrega campos extra a tus inventarios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar campo..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
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
          data={paginatedFields}
          loading={isLoadingCustomFields}
          rowActions={rowActions}
          pagination={{
            currentPage: currentPage,
            totalPages: Math.ceil(filteredFields.length / pageSize),
            totalRecords: filteredFields.length,
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
        title={editMode ? 'Editar Campo' : 'Nuevo Campo'}
        schema={CustomFieldFormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        formFields={<CustomFieldFields />}
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

export default CustomFields;
