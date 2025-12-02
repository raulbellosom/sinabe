import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { HiCubeTransparent } from 'react-icons/hi';
import { Link } from 'react-router-dom';

import { useCatalogContext } from '../../../context/CatalogContext';
import ModalRemove from '../../../components/Modals/ModalRemove';
import { searchModels } from '../../../services/api';
import CreateMultipleModels from './CreateMultipleModels';
import ModelFormFields from '../../../components/InventoryComponents/ModelForm/ModelFormFields';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import { ModelFormSchema } from '../../../components/InventoryComponents/ModelForm/ModelFormSchema';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import ReusableTable from '../../../components/Table/ReusableTable';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';
import ReusableModal from '../../../components/Modals/ReusableModal'; // Import ReusableModal

const Models = () => {
  const {
    createInventoryModel,
    updateInventoryModel,
    deleteInventoryModel,
    inventoryBrands,
    inventoryTypes,
    createInventoryBrand,
    createInventoryType,
  } = useCatalogContext();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [createMultipleModelsModal, setCreateMultipleModelsModal] =
    useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [deleteModelId, setDeleteModelId] = useState(null);
  const [initialValues, setInitialValues] = useState({
    name: '',
    brandId: '',
    typeId: '',
    id: '',
    count: 0,
  });
  const [refreshData, setRefreshData] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    pageSize: 10,
    page: currentPageNumber,
    sortBy: 'name',
    order: 'asc',
  });

  const {
    data: modelsData,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['models', { ...searchFilters }],
    queryFn: ({ signal }) => searchModels({ ...searchFilters, signal }),
    staleTime: Infinity,
  });

  useEffect(() => {
    refetch();
    setRefreshData(false);
  }, [searchFilters, refreshData]);

  const handlePageChange = (page) => {
    setSearchFilters((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize) => {
    setSearchFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  const handleSearch = (e) => {
    setSearchFilters((prev) => ({
      ...prev,
      searchTerm: e.target.value,
      page: 1,
    }));
  };

  const onEditModel = (model) => {
    setEditMode(true);
    setInitialValues({
      id: model.id,
      name: model.name,
      brandId: model.brandId,
      typeId: model.typeId,
      count: model.count,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateInventoryModel(values)
        : await createInventoryModel(values);
      setSubmitting(false);
      resetForm();
      setInitialValues({
        name: '',
        brandId: '',
        typeId: '',
        id: '',
        count: 0,
      });
      setIsOpenModal(false);
      setRefreshData(true);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInventoryModel(deleteModelId);
      setIsRemoveModalOpen(false);
      setDeleteModelId(null);
      setRefreshData(true);
    } catch (error) {
      console.log(error);
      setIsRemoveModalOpen(false);
    }
  };

  const onCloseModal = () => {
    setEditMode(false);
    setInitialValues({
      name: '',
      brandId: '',
      typeId: '',
      id: '',
      count: 0,
    });
    setIsOpenModal(false);
  };

  const onRemoveModel = (id) => {
    setDeleteModelId(id);
    setIsRemoveModalOpen(true);
  };

  const isCreatePermission = useCheckPermissions('create_inventories_models');
  const isEditPermission = useCheckPermissions('edit_inventories_models');
  const isDeletePermission = useCheckPermissions('delete_inventories_models');

  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Modelo', // Changed from label to title
        sortable: true,
        render: (value) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <HiCubeTransparent className="text-indigo-600 dark:text-indigo-400 text-lg" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {value}
            </span>
          </div>
        ),
      },
      {
        key: 'type.name',
        title: 'Tipo', // Changed from label to title
        render: (value) => (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
            {value}
          </span>
        ),
      },
      {
        key: 'brand.name',
        title: 'Marca', // Changed from label to title
        render: (value) => (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
            {value}
          </span>
        ),
      },
      {
        key: 'inventoryCount',
        title: 'Cantidad', // Changed from label to title
        sortable: true,
        render: (value, row) => (
          <Link
            to={`/inventories?modelName=${encodeURIComponent(row.name)}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-indigo-100 hover:text-indigo-800 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300"
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
        action: () => onEditModel(row),
        color: 'yellow',
      });
    }
    if (isDeletePermission.hasPermission) {
      actions.push({
        key: 'delete',
        label: 'Eliminar',
        icon: FaTrash,
        action: () => onRemoveModel(row.id),
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
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <HiCubeTransparent className="text-indigo-600 dark:text-indigo-400 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Modelos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona los modelos de tus productos
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar modelo..."
              value={searchFilters.searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 items-center w-full md:w-fit">
            {isCreatePermission.hasPermission && (
              <ActionButtons
                extraActions={[
                  {
                    label: 'Carga Masiva',
                    action: () => setCreateMultipleModelsModal(true),
                    color: 'green',
                    filled: true,
                  },
                ]}
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
          data={modelsData?.data || []}
          loading={isLoading}
          rowActions={rowActions}
          pagination={{
            currentPage: searchFilters.page,
            totalPages: modelsData?.pagination?.totalPages || 1,
            totalRecords: modelsData?.pagination?.totalRecords || 0,
            pageSize: searchFilters.pageSize,
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPagination={true}
          rowClassName={() =>
            'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer'
          }
        />
      </div>

      <ModalFormikForm
        onClose={onCloseModal}
        isOpenModal={isOpenModal}
        title={editMode ? 'Editar Modelo' : 'Nuevo Modelo'}
        schema={ModelFormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        formFields={
          <ModelFormFields
            inventoryBrands={inventoryBrands}
            inventoryTypes={inventoryTypes}
            createBrand={createInventoryBrand}
            createType={createInventoryType}
          />
        }
        saveLabel={editMode ? 'Actualizar' : 'Guardar'}
      />

      {/* Wrapped CreateMultipleModels in ReusableModal */}
      <ReusableModal
        isOpen={createMultipleModelsModal}
        onClose={() => setCreateMultipleModelsModal(false)}
        title="Cargar Múltiples Modelos"
        size="lg"
      >
        <CreateMultipleModels />
      </ReusableModal>

      <ModalRemove
        isOpenModal={isRemoveModalOpen}
        onCloseModal={() => setIsRemoveModalOpen(false)}
        removeFunction={handleDelete}
      />
    </div>
  );
};

export default Models;
