import React, { useCallback, useEffect, useRef, useState, lazy } from 'react';

import Skeleton from 'react-loading-skeleton';
import { useQuery } from '@tanstack/react-query';
import { IoMdAdd } from 'react-icons/io';
import { MdOutlineFileUpload } from 'react-icons/md';

import { useCatalogContext } from '../../../context/CatalogContext';
import ModalForm from '../../../components/Modals/ModalForm';
import ModalRemove from '../../../components/Modals/ModalRemove';
import { searchModels } from '../../../services/api';
import { modelColumns } from '../../../utils/CatalogsFields';
import CreateMultipleModels from './CreateMultipleModels';
import Notifies from '../../../components/Notifies/Notifies';
import ModelFormFields from '../../../components/InventoryComponents/ModelForm/ModelFormFields';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import { ModelFormSchema } from '../../../components/InventoryComponents/ModelForm/ModelFormSchema';
import { HiCubeTransparent } from 'react-icons/hi';
import withPermission from '../../../utils/withPermissions';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import CatalogCardList from '../../../components/InventoryComponents/CatalogCardList';
const TableHeader = lazy(() => import('../../../components/Table/TableHeader'));
const TableActions = lazy(
  () => import('../../../components/Table/TableActions'),
);
const TableResultsNotFound = lazy(
  () => import('../../../components/Table/TableResultsNotFound'),
);

const Models = () => {
  const {
    inventoryBrands,
    inventoryTypes,
    createInventoryModel,
    updateInventoryModel,
    deleteInventoryModel,
  } = useCatalogContext();
  const [columns, setColumns] = useState([...modelColumns]);
  const lastChange = useRef();
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
  });
  const [refreshData, setRefreshData] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    pageSize: 5,
    page: currentPageNumber,
    sortBy: 'name',
    order: 'asc',
  });

  const {
    data: models,
    refetch,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: ['models', { ...searchFilters }],
    queryFn: ({ signal }) => searchModels({ ...searchFilters, signal }),
    staleTime: Infinity,
  });

  useEffect(() => {
    refetch();
    setRefreshData(false);
  }, [searchFilters, refreshData]);

  const goOnPrevPage = useCallback(() => {
    setSearchFilters((prevState) => {
      return {
        ...prevState,
        page: prevState?.page - 1,
      };
    });
  }, []);

  const goOnNextPage = useCallback(() => {
    setSearchFilters((prevState) => {
      return {
        ...prevState,
        page: prevState?.page + 1,
      };
    });
  }, []);

  const handleSelectChange = useCallback((page) => {
    setSearchFilters((prevState) => {
      return {
        ...prevState,
        page,
      };
    });
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (lastChange.current) {
        clearTimeout(lastChange.current);
      }
      lastChange.current = setTimeout(() => {
        lastChange.current = null;
        setSearchFilters((prevState) => {
          return {
            ...prevState,
            searchTerm: e.target.value,
          };
        });
      }, 600);
    },
    [searchFilters?.searchTerm],
  );

  const changePageSize = (e) => {
    setSearchFilters((prevState) => {
      return {
        ...prevState,
        pageSize: e.target.value,
      };
    });
  };

  const sortBy = (column) => {
    const selectedHeaderIndex = columns?.findIndex((col) => col.id === column);
    let updatedHeaders = [];
    if (selectedHeaderIndex !== -1) {
      const selectedHeader = columns[selectedHeaderIndex];
      const updatedHeader = {
        ...selectedHeader,
        order: selectedHeader?.order === 'asc' ? 'desc' : 'asc',
      };
      updatedHeaders = [...columns];
      updatedHeaders[selectedHeaderIndex] = updatedHeader;
      setSearchFilters((prevState) => {
        return {
          ...prevState,
          sortBy: column,
          order: updatedHeader?.order,
        };
      });
    }
    setColumns(updatedHeaders);
  };

  const onEditModel = (model) => {
    setEditMode(true);
    setInitialValues({
      id: model.id,
      name: model.name,
      brandId: model.brandId,
      typeId: model.typeId,
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
      setEditMode(false);
      setInitialValues({
        id: '',
        name: '',
        brandId: '',
        typeId: '',
      });
      setIsOpenModal(false);
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  const onCloseModal = () => {
    setIsOpenModal(false);
    setEditMode(false);
    setInitialValues({
      id: '',
      name: '',
      brandId: '',
      typeId: '',
    });
  };

  const onDeleteModel = (id) => {
    setDeleteModelId(id);
    setIsRemoveModalOpen(true);
  };

  const handleRemoveModel = async () => {
    try {
      await deleteInventoryModel(deleteModelId);
      setIsRemoveModalOpen(false);
      setDeleteModelId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefreshData = () => {
    setRefreshData(true);
    Notifies('success', 'Datos actualizados correctamente');
  };

  const isEditPermission = useCheckPermissions('edit_inventories_models');
  const isCreatePermission = useCheckPermissions('create_inventories_models');
  const isDeletePermission = useCheckPermissions('delete_inventories_models');
  return (
    <div className="flex min-h-[77dvh] h-full flex-col gap-3 bg-white shadow-md rounded-md dark:bg-gray-900 p-3 antialiased">
      <TableHeader
        icon={HiCubeTransparent}
        title={'Modelos'}
        actions={[
          {
            label: 'Cargar',
            action: isCreatePermission.hasPermission
              ? () => setCreateMultipleModelsModal(true)
              : null,
            color: 'blue',
            icon: MdOutlineFileUpload,
          },
          {
            label: 'Nuevo',
            action: isCreatePermission.hasPermission
              ? () => setIsOpenModal(true)
              : null,
            color: 'mycad',
            icon: IoMdAdd,
            filled: true,
          },
        ]}
      />
      <TableActions
        onRefreshData={handleRefreshData}
        handleSearchTerm={handleSearch}
        headers={columns}
      />
      {models && !isPending ? (
        models?.data?.length > 0 ? (
          <CatalogCardList
            data={models.data.map((model) => ({
              ...model,
              name: model.name,
              description: `${model.type.name} - ${model.brand.name}`,
            }))}
            title="Modelos de los inventarios"
            hiddeHeader
            onCreate={
              isCreatePermission.hasPermission
                ? () => setIsOpenModal(true)
                : null
            }
            onEdit={
              isEditPermission.hasPermission
                ? (type) => onEditBrand(type)
                : null
            }
            onRemove={
              isDeletePermission.hasPermission
                ? (type) => onRemoveBrand(type.id)
                : null
            }
          />
        ) : (
          <TableResultsNotFound />
        )
      ) : (
        <Skeleton count={10} className="h-10" />
      )}

      {isOpenModal && (
        <ModalFormikForm
          onClose={onCloseModal}
          isOpenModal={isOpenModal}
          dismissible
          size={'2xl'}
          title={editMode ? 'Editar Modelo' : 'Crear Modelo'}
          schema={ModelFormSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          formFields={
            <ModelFormFields
              inventoryBrands={inventoryBrands}
              inventoryTypes={inventoryTypes?.map((type) => {
                return {
                  ...type,
                  name: type.name,
                };
              })}
            />
          }
          saveLabel={editMode ? 'Actualizar' : 'Guardar'}
        />
      )}
      <ModalRemove
        isOpenModal={isRemoveModalOpen}
        onCloseModal={() => setIsRemoveModalOpen(false)}
        removeFunction={handleRemoveModel}
      />
      {createMultipleModelsModal && (
        <ModalForm
          onClose={() => setCreateMultipleModelsModal(false)}
          title="Cargar múltiples modelos"
          isOpenModal={createMultipleModelsModal}
        >
          <CreateMultipleModels />
        </ModalForm>
      )}
    </div>
  );
};

const ProtectedModels = withPermission(Models, 'view_inventories_models');

export default ProtectedModels;
