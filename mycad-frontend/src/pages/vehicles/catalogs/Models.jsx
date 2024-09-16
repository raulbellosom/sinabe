import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCatalogContext } from '../../../context/CatalogContext';
import Skeleton from 'react-loading-skeleton';
import ModalForm from '../../../components/Modals/ModalForm';
import ModalRemove from '../../../components/Modals/ModalRemove';
import { searchModels } from '../../../services/api';
import { modelColumns } from '../../../utils/CatalogsFields';
import { useQuery } from '@tanstack/react-query';
import TableHeader from '../../../components/Table/TableHeader';
import { IoMdAdd } from 'react-icons/io';
import { MdOutlineFileUpload } from 'react-icons/md';
import TableActions from '../../../components/Table/TableActions';
import TableResultsNotFound from '../../../components/Table/TableResultsNotFound';
import { Table as T } from 'flowbite-react';
import TableFooter from '../../../components/Table/TableFooter';
import Card from '../../../components/Card/Card';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';
import CreateMultipleModels from './CreateMultipleModels';
import Notifies from '../../../components/Notifies/Notifies';
const Table = React.lazy(() => import('../../../components/Table/Table'));
const ModelForm = React.lazy(
  () => import('../../../components/VehicleComponents/ModelForm/ModelForm'),
);

const Models = () => {
  const {
    vehicleBrands,
    vehicleTypes,
    createVehicleModel,
    updateVehicleModel,
    deleteVehicleModel,
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
    year: '',
    id: '',
  });
  // const [vehicleId, setVehicleId] = useState(null);
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
      selectedHeader;
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
      year: parseInt(model.year, 10),
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateVehicleModel(values)
        : await createVehicleModel(values);
      setSubmitting(false);
      resetForm();
      setEditMode(false);
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
      year: '',
    });
  };

  const onDeleteModel = (id) => {
    setDeleteModelId(id);
    setIsRemoveModalOpen(true);
  };

  const handleRemoveModel = async () => {
    try {
      await deleteVehicleModel(deleteModelId);
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

  return (
    <div className="flex flex-col gap-3 bg-white shadow-md rounded-md dark:bg-gray-900 p-3 antialiased">
      <TableHeader
        title={'Modelos'}
        actions={[
          {
            label: 'Cargar',
            action: () => setCreateMultipleModelsModal(true),
            color: 'blue',
            icon: MdOutlineFileUpload,
          },
          {
            label: 'Nuevo',
            action: () => setIsOpenModal(true),
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
          <>
            <div className="hidden md:block">
              <Table
                columns={columns}
                sortBy={sortBy}
                sortedBy={searchFilters.sortBy}
              >
                {models &&
                  !isPending &&
                  models?.data?.map((model, index) => {
                    const parseModel = {
                      model: model.name,
                      'brand.name': model.brand.name,
                      'type.name': model.type.name,
                      year: model.year,
                    };
                    return (
                      <T.Row key={model.id}>
                        {columns.map((column) =>
                          column.id === 'model' ||
                          column.id === 'brand.name' ||
                          column.id === 'type.name' ||
                          column.id === 'year' ? (
                            <T.Cell
                              className={`${column?.id === 'model' ? 'font-bold' : ''}`}
                              key={column.id}
                            >
                              {parseModel[column.id]}
                            </T.Cell>
                          ) : (
                            <T.Cell key={column?.id}>
                              <div className="flex justify-center items-center gap-2">
                                <ActionButtons
                                  onEdit={() => onEditModel(model)}
                                  onRemove={() => onDeleteModel(model.id)}
                                />
                              </div>
                            </T.Cell>
                          ),
                        )}
                      </T.Row>
                    );
                  })}
              </Table>
            </div>
            <div className="md:hidden py-2 flex flex-col gap-6">
              {models?.data?.map((model, index) => {
                const parseModel = {
                  model: {
                    key: 'Modelo',
                    value: model.name,
                  },
                  brand: {
                    key: 'Marca',
                    value: model.brand.name,
                  },
                  type: {
                    key: 'Tipo',
                    value: model.type.name,
                  },
                  year: {
                    key: 'Año',
                    value: model.year,
                  },
                  actions: {
                    key: 'Acciones',
                    value: (
                      <ActionButtons
                        onEdit={() => onEditModel(model)}
                        onRemove={() => onDeleteModel(model.id)}
                      />
                    ),
                  },
                };
                return <Card key={model.id} data={parseModel} />;
              })}
            </div>
          </>
        ) : (
          <TableResultsNotFound />
        )
      ) : (
        <Skeleton count={10} className="h-10" />
      )}
      {models?.pagination && (
        <TableFooter
          pagination={models?.pagination}
          goOnNextPage={goOnNextPage}
          goOnPrevPage={goOnPrevPage}
          handleSelectChange={handleSelectChange}
          changePageSize={changePageSize}
        />
      )}
      <ModalForm
        onClose={onCloseModal}
        title={editMode ? 'Editar Modelo' : 'Crear Nuevo Modelo'}
        isOpenModal={isOpenModal}
      >
        <ModelForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          vehicleBrands={vehicleBrands}
          vehicleTypes={vehicleTypes}
          isUpdate={editMode}
        />
      </ModalForm>
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

export default Models;
