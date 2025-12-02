import React, { useEffect, useState, useMemo } from 'react';
import { useCatalogContext } from '../../../context/CatalogContext';
import ModalRemove from '../../../components/Modals/ModalRemove';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import BrandFormFields from '../../../components/InventoryComponents/BrandForm/BrandFormFields';
import { BrandFormSchema } from '../../../components/InventoryComponents/BrandForm/BrandFormSchema';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import ReusableTable from '../../../components/Table/ReusableTable';
import ActionButtons from '../../../components/ActionButtons/ActionButtons';

const Brands = () => {
  const {
    inventoryBrands,
    createInventoryBrand,
    updateInventoryBrand,
    deleteInventoryBrand,
    loading,
  } = useCatalogContext();

  const [brands, setBrands] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removeBrandId, setRemoveBrandId] = useState(null);
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
    const formattedBrands = inventoryBrands.map((brand) => {
      return {
        id: brand.id,
        name: brand.name,
        count: brand.count,
      };
    });
    formattedBrands.sort((a, b) => a.name.localeCompare(b.name));
    setBrands(formattedBrands);
  }, [inventoryBrands]);

  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brands;
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [brands, searchTerm]);

  // Client-side Pagination
  const paginatedBrands = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBrands.slice(startIndex, startIndex + pageSize);
  }, [filteredBrands, currentPage, pageSize]);

  const onEditBrand = (brand) => {
    setEditMode(true);
    setInitialValues({
      id: brand.id,
      name: brand.name,
      count: brand.count,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode
        ? await updateInventoryBrand(values)
        : await createInventoryBrand(values);
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

  const handleDeleteInventoryBrand = async () => {
    try {
      await deleteInventoryBrand(removeBrandId);
      setIsDeleteModalOpen(false);
      setRemoveBrandId(null);
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

  const onRemoveBrand = (id) => {
    setRemoveBrandId(id);
    setIsDeleteModalOpen(true);
  };

  const isCreatePermission = useCheckPermissions('create_inventories_brands');
  const isEditPermission = useCheckPermissions('edit_inventories_brands');
  const isDeletePermission = useCheckPermissions('delete_inventories_brands');

  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Marca', // Changed from label to title
        sortable: true,
        render: (value) => (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <PiTrademarkRegisteredBold className="text-blue-600 dark:text-blue-400 text-lg" />
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
            to={`/inventories?brandName=${encodeURIComponent(row.name)}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-800 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
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
        action: () => onEditBrand(row),
        color: 'yellow',
      });
    }
    if (isDeletePermission.hasPermission) {
      actions.push({
        key: 'delete',
        label: 'Eliminar',
        icon: FaTrash,
        action: () => onRemoveBrand(row.id),
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
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <PiTrademarkRegisteredBold className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Marcas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gestiona las marcas de tus productos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar marca..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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
          data={paginatedBrands} // Use paginated data
          loading={loading}
          rowActions={rowActions}
          pagination={{
            currentPage: currentPage,
            totalPages: Math.ceil(filteredBrands.length / pageSize),
            totalRecords: filteredBrands.length,
            pageSize: pageSize,
          }}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          showPagination={true} // Enable pagination
          rowClassName={() =>
            'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer'
          }
        />
      </div>

      <ModalFormikForm
        onClose={onCloseModal}
        isOpenModal={isOpenModal}
        title={editMode ? 'Editar Marca' : 'Nueva Marca'}
        schema={BrandFormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        formFields={<BrandFormFields />}
        saveLabel={editMode ? 'Actualizar' : 'Guardar'}
      />

      <ModalRemove
        isOpenModal={isDeleteModalOpen}
        onCloseModal={() => setIsDeleteModalOpen(false)}
        removeFunction={handleDeleteInventoryBrand}
      />
    </div>
  );
};

export default Brands;
