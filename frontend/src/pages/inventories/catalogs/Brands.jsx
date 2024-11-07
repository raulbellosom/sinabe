import React, { useEffect, useState } from 'react';
import { useCatalogContext } from '../../../context/CatalogContext';
import CatalogList from '../../../components/InventoryComponents/CatalogList';
import ModalRemove from '../../../components/Modals/ModalRemove';
import ModalFormikForm from '../../../components/Modals/ModalFormikForm';
import BrandFormFields from '../../../components/InventoryComponents/BrandForm/BrandFormFields';
import { BrandFormSchema } from '../../../components/InventoryComponents/BrandForm/BrandFormSchema';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import useCheckPermissions from '../../../hooks/useCheckPermissions';
import withPermission from '../../../utils/withPermissions';

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

  return (
    <div className="w-full h-full">
      {brands && !loading ? (
        <CatalogList
          icon={PiTrademarkRegisteredBold}
          data={brands}
          title="Marcas de los inventarios"
          onCreate={
            isCreatePermission.hasPermission ? () => setIsOpenModal(true) : null
          }
          onEdit={
            isEditPermission.hasPermission ? (type) => onEditBrand(type) : null
          }
          onRemove={
            isDeletePermission.hasPermission
              ? (type) => onRemoveBrand(type.id)
              : null
          }
        />
      ) : (
        <CatalogList.Skeleton />
      )}
      {isOpenModal && (
        <ModalFormikForm
          onClose={onCloseModal}
          isOpenModal={isOpenModal}
          dismissible
          title={editMode ? 'Editar Marca' : 'Crear Marca'}
          schema={BrandFormSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          formFields={<BrandFormFields />}
          saveLabel={editMode ? 'Actualizar' : 'Guardar'}
        />
      )}
      <ModalRemove
        isOpenModal={isDeleteModalOpen}
        onCloseModal={() => setIsDeleteModalOpen(false)}
        removeFunction={handleDeleteInventoryBrand}
      />
    </div>
  );
};

const ProtectedBrandsView = withPermission(Brands, 'view_inventories_brands');

export default ProtectedBrandsView;
