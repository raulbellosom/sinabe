import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Spinner, TextInput, Badge } from 'flowbite-react';
import { FaFileInvoice, FaSearch, FaTrash } from 'react-icons/fa';
import {
  getCustodyRecords,
  deleteCustodyRecord,
} from '../../services/custody.api';
import Breadcrumb from '../../components/Breadcrum/Breadcrumb';
import FileIcon from '../../components/FileIcon/FileIcon';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { parseToLocalDate } from '../../utils/formatValues';
import ReusableTable from '../../components/Table/ReusableTable';

const CustodyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['custody-records', query],
    queryFn: () => getCustodyRecords(query),
    keepPreviousData: true,
  });

  const records = response?.data || [];
  const pagination = response?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: 10,
  };

  const deleteMutation = useMutation({
    mutationFn: deleteCustodyRecord,
    onSuccess: () => {
      queryClient.invalidateQueries(['custody-records']);
    },
    onError: (error) => {
      console.error('Error deleting record:', error);
      alert('Error al eliminar el resguardo');
    },
  });

  const handleDelete = (id) => {
    if (
      window.confirm('¿Estás seguro de que deseas eliminar este resguardo?')
    ) {
      deleteMutation.mutate(id);
    }
  };

  const breadcrumbs = [
    { label: 'Inicio', path: '/' },
    { label: 'Resguardos', path: '/custody' },
  ];

  const columns = useMemo(
    () => [
      {
        key: 'date',
        title: 'Fecha',
        render: (val) => parseToLocalDate(val),
        sortable: true,
      },
      {
        key: 'receiver',
        title: 'Receptor',
        render: (val) => (val ? `${val.firstName} ${val.lastName}` : 'N/A'),
        sortable: true,
      },
      {
        key: 'employeeNumber',
        title: 'No. Empleado',
        render: (_, row) => row.receiver?.employeeNumber || 'N/A',
        sortable: true,
      },
      {
        key: 'deliverer',
        title: 'Entregado Por',
        render: (val) => (val ? `${val.firstName} ${val.lastName}` : 'N/A'),
        sortable: true,
      },
      {
        key: 'items',
        title: 'Equipos',
        render: (val) => (
          <Badge color="info" className="w-fit">
            {val ? val.length : 0} Equipos
          </Badge>
        ),
      },
      {
        key: 'file',
        title: 'Archivo',
        render: (val) =>
          val ? (
            <div className="w-48">
              <FileIcon
                file={{
                  ...val,
                  name: 'Ver PDF',
                  type: 'application/pdf',
                }}
              />
            </div>
          ) : (
            '-'
          ),
      },
      {
        key: 'actions',
        title: 'Acciones',
      },
    ],
    [],
  );

  const handleSort = (key) => {
    setQuery((prev) => {
      const isSameKey = prev.sortBy === key;
      const newOrder = isSameKey && prev.sortOrder === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortBy: key, sortOrder: newOrder };
    });
  };

  const rowActions = (record) => [
    {
      key: 'delete',
      label: 'Eliminar',
      icon: FaTrash,
      action: () => handleDelete(record.id),
      color: 'red',
    },
  ];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 p-10 text-center">
        Error al cargar los resguardos. Por favor intente de nuevo.
      </div>
    );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 border-gray-100 border">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaFileInvoice className="text-purple-500" />
          Resguardos Tecnológicos
        </h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          <div className="w-full md:w-96">
            <TextInput
              id="search"
              type="text"
              icon={FaSearch}
              placeholder="Buscar por nombre, empleado, serie, modelo..."
              value={query.searchTerm}
              onChange={(e) =>
                setQuery((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                  page: 1,
                }))
              }
            />
          </div>
          <ActionButtons
            onCreate={() => navigate('/custody/create')}
            labelCreate="Nuevo Resguardo"
          />
        </div>
      </div>

      <ReusableTable
        columns={columns}
        data={records}
        pagination={pagination}
        onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) =>
          setQuery((prev) => ({ ...prev, pageSize, page: 1 }))
        }
        sortConfig={{ key: query.sortBy, direction: query.sortOrder }}
        onSort={handleSort}
        rowActions={rowActions}
      />
    </div>
  );
};

export default CustodyPage;
