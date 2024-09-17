import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import { IoMdAdd } from 'react-icons/io';
import { MdOutlineFileUpload } from 'react-icons/md';
import { Table as T } from 'flowbite-react';
import ModalForm from '../../components/Modals/ModalForm';
import ModalRemove from '../../components/Modals/ModalRemove';
import { searchUsers } from '../../services/api';
import usersColumns from '../../utils/usersColumns';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import Notifies from '../../components/Notifies/Notifies';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import { useAuthContext } from '../../context/AuthContext';
const Card = React.lazy(() => import('../../components/Card/Card'));
const TableHeader = React.lazy(
  () => import('../../components/Table/TableHeader'),
);
const TableFooter = React.lazy(
  () => import('../../components/Table/TableFooter'),
);
const TableActions = React.lazy(
  () => import('../../components/Table/TableActions'),
);
const TableResultsNotFound = React.lazy(
  () => import('../../components/Table/TableResultsNotFound'),
);
const Table = React.lazy(() => import('../../components/Table/Table'));

const Users = () => {
  const lastChange = useRef();
  const { user: sesionUser } = useAuthContext();
  const { createUser, deleteUser, updateUser } = useUserContext();
  const [columns, setColumns] = useState(usersColumns);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    photo: '',
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
    data: users,
    refetch,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: ['users', searchFilters],
    queryFn: ({ signal }) => searchUsers(searchFilters, signal),
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

  const handleRefreshData = () => {
    setRefreshData(true);
    Notifies('success', 'Datos actualizados correctamente');
  };

  const onEditUser = (item) => {
    setEditMode(true);
    setInitialValues({
      id: item.id,
      name: item.name,
      email: item.email,
    });
    setIsOpenModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      editMode ? await updateUser(values) : await createUser(values);
      setSubmitting(false);
      resetForm();
      setEditMode(false);
      setIsOpenModal(false);
    } catch (err) {
      console.log('error on submit create or edit user', err);
      Notifies('error', 'Error al guardar el usuario');
    }
  };

  const onCloseModal = () => {
    setIsOpenModal(false);
    setEditMode(false);
    setInitialValues({
      name: '',
      email: '',
      phone: '',
      role: '',
      photo: '',
    });
  };

  const onRemoveUser = (id) => {
    setDeleteUserId(id);
    setIsRemoveModalOpen(true);
  };

  const onConfirmRemoveUser = async () => {
    try {
      await deleteUser(deleteUserId);
      setIsRemoveModalOpen(false);
      setDeleteUserId(null);
    } catch (err) {
      console.log('error on remove user', err);
      Notifies('error', 'Error al eliminar el usuario');
    }
  };

  return (
    <div className="flex flex-col gap-3 bg-white shadow-md rounded-md dark:bg-gray-900 p-3 antialiased">
      <TableHeader
        title={'Usuarios'}
        actions={[
          {
            label: 'Nuevo',
            action:
              sesionUser?.role.id <= 2 ? () => setIsOpenModal(true) : null,
            color: 'orange',
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
      {users && !isPending ? (
        users?.data?.length > 0 ? (
          <>
            <div className="hidden md:block">
              <Table
                columns={columns}
                sortBy={sortBy}
                sortedBy={searchFilters?.sortBy}
              >
                {users?.data?.map((user) => {
                  const formatedUser = {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    'role.name': user.role.name,
                    photo: user.photo ?? [],
                  };
                  return (
                    <T.Row key={user.id}>
                      {columns.map((column) =>
                        column.id === 'photo' ? (
                          <T.Cell key={column.id}>
                            {formatedUser[column.id]?.length > 0 ? (
                              <ImageViewer
                                containerClassNames={
                                  'first:w-12 first:h-12 first:rounded-md'
                                }
                                images={formatedUser[column.id]}
                                alt={`${formatedUser.firstName} ${formatedUser.lastName}`}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-stone-200 flex justify-center items-center gap-2">
                                <span className="text-stone-500 font-bold text-2xl">
                                  {formatedUser.firstName[0] +
                                    formatedUser.lastName[0]}
                                </span>
                              </div>
                            )}
                          </T.Cell>
                        ) : column.id === 'firstName' ||
                          column.id === 'lastName' ||
                          column.id === 'email' ||
                          column.id === 'phone' ||
                          column.id === 'role.name' ? (
                          <T.Cell
                            className={`${column?.id === 'firstName' ? 'font-bold' : ''}`}
                            key={column.id}
                          >
                            {formatedUser[column.id]}
                          </T.Cell>
                        ) : column.id === 'actions' && sesionUser ? (
                          <T.Cell key={column?.id}>
                            <div className="flex justify-center items-center gap-2">
                              <ActionButtons
                                onEdit={() => onEditUser(user)}
                                onRemove={() => onRemoveUser(user.id)}
                              />
                            </div>
                          </T.Cell>
                        ) : null,
                      )}
                    </T.Row>
                  );
                })}
              </Table>
            </div>
            <div className="md:hidden flex py-2 flex-col gap-6">
              {users?.data?.map((user) => {
                const formatedUser = {
                  image: {
                    key: 'Foto',
                    value: user.photo[0] ?? [],
                  },
                  firstName: {
                    key: 'Nombre',
                    value: user.firstName,
                  },
                  lastName: {
                    key: 'Apellido',
                    value: user.lastName,
                  },
                  email: {
                    key: 'Correo',
                    value: user.email,
                  },
                  phone: {
                    key: 'Teléfono',
                    value: user.phone,
                  },
                  role: {
                    key: 'Rol',
                    value: user.role.name,
                  },
                  actions: {
                    key: 'Acciones',
                    value: (
                      <ActionButtons
                        onEdit={() => onEditUser(user)}
                        onRemove={() => onRemoveUser(user.id)}
                      />
                    ),
                  },
                };
                return <Card key={user.id} data={formatedUser} />;
              })}
            </div>
          </>
        ) : (
          <TableResultsNotFound />
        )
      ) : (
        <Skeleton count={5} className="h-10" />
      )}
      {users?.pagination && (
        <TableFooter
          pagination={users?.pagination}
          goOnNextPage={goOnNextPage}
          goOnPrevPage={goOnPrevPage}
          handleSelectChange={handleSelectChange}
          changePageSize={changePageSize}
        />
      )}
      {/* <ModalForm
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
      </ModalForm> */}
      {/* <ModalRemove
        isOpenModal={isRemoveModalOpen}
        onCloseModal={() => setIsRemoveModalOpen(false)}
        removeFunction={handleRemoveModel}
      /> */}
    </div>
  );
};

export default Users;
