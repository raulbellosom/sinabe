// src/pages/ProjectsPage.jsx
import { useMemo, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { FaEye, FaPen, FaPlus, FaTrash } from 'react-icons/fa';

import {
  useDeleteProject,
  useProjectSearch,
  useUpdateProject,
} from '../../hooks/useProjects';
import { useProjectQueryParams } from '../../hooks/useProjectQueryParams';
import { useVerticals } from '../../hooks/useVerticals';
import { useCreateProject } from '../../hooks/useProjects';

import ProjectSummaryCards from '../../components/Projects/ProjectSummaryCards';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import ProjectFormModal from '../../components/Projects/ProjectFormModal';
import FilterDropdown from '../../components/Inputs/FilterDropdown';
import ReusableTable from '../../components/Table/ReusableTable';
import Notifies from '../../components/Notifies/Notifies';
import ProjectSearchBar from '../../components/Projects/ProjectSearchBar';
import ProjectProgressBar from '../../components/Projects/ProjectProgressBar';
import ProjectStatusBadge from '../../components/Projects/ProjectStatusBadge';

const ProjectsPage = () => {
  const [searchParams] = useSearchParams();
  const { query, updateParams } = useProjectQueryParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { mutate: deleteProject } = useDeleteProject();

  const { searchTerm, statuses, verticalIds, page, pageSize, sortBy, order } =
    query;

  const { data: verticals = [] } = useVerticals();
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: updateProject } = useUpdateProject();
  const navigate = useNavigate();

  // Ejecutar solo una vez si no hay parámetros
  useEffect(() => {
    if (!searchParams.get('page')) {
      updateParams({
        searchTerm: '',
        statuses: [],
        verticalIds: [],
        page: 1,
        pageSize: 10,
        sortBy: 'updatedAt',
        order: 'desc',
      });
    }
  }, []);

  const { data, isLoading, error, refetch } = useProjectSearch(query);
  const projects = data?.data || [];
  const pagination = data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: query.pageSize,
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (selectedProject) {
        await updateProject({ id: selectedProject.id, data: values });
        Notifies('success', 'Proyecto actualizado correctamente');
      } else {
        await createProject(values);
        Notifies('success', 'Proyecto creado correctamente');
      }

      resetForm();
      setIsModalOpen(false);
      setSelectedProject(null);
      refetch(); // actualiza la tabla
    } catch (error) {
      Notifies(
        'error',
        error?.response?.data?.message || 'Error al guardar proyecto',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'code',
        title: 'Código',
        sortable: true,
        render: (_, item) => (
          <span className="font-mono text-sm text-nowrap">{item.code}</span>
        ),
      },
      {
        key: 'name',
        title: 'Proyecto',
        sortable: true,
        render: (_, item) => <span className="min-w-48">{item.name}</span>,
      },
      {
        key: 'verticals',
        title: 'Verticales',
        render: (_, item) => {
          if (!item?.deadlines || !Array.isArray(item.deadlines)) {
            return <span className="text-gray-400 text-sm">—</span>;
          }

          const verticalNamesSet = new Set();

          item.deadlines.forEach((deadline) => {
            deadline?.inventoryAssignments?.forEach((assignment) => {
              assignment?.inventory?.model?.ModelVertical?.forEach((mv) => {
                const name = mv?.vertical?.name;
                if (name) verticalNamesSet.add(name);
              });
            });
          });

          const verticalNames = Array.from(verticalNamesSet);

          return verticalNames.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {verticalNames.map((name, idx) => (
                <span
                  key={idx}
                  className="bg-sinabe-primary/10 text-sinabe-primary text-xs font-medium px-2 py-0.5 rounded-md"
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 text-sm">—</span>
          );
        },
      },
      {
        key: 'provider',
        title: 'Proveedor',
        sortable: true,
      },
      {
        key: 'status',
        title: 'Estado',
        sortable: true,
        render: (_, item) => (
          <ProjectStatusBadge status={item.status?.replace('_', ' ')} />
        ),
      },
      {
        key: 'progress',
        title: 'Progreso',
        render: (_, item) => {
          if (!item || !Array.isArray(item.purchaseOrders)) return null;

          const used = item.purchaseOrders
            .flatMap((oc) => oc.invoices || [])
            .reduce((acc, f) => acc + (f.amount || 0), 0);

          const total = item.budgetTotal || 0;
          const percentage = total > 0 ? (used / total) * 100 : 0;

          return <ProjectProgressBar value={percentage} />;
        },
      },
      {
        key: 'budgetTotal',
        title: 'Presupuesto',
        sortable: true,
        render: (_, item) => {
          if (!item || !Array.isArray(item.purchaseOrders)) return null;

          const used = item.purchaseOrders
            .flatMap((oc) => oc.invoices || [])
            .reduce((acc, f) => acc + (f.amount || 0), 0);

          return (
            <div>
              <div className="font-semibold text-sm">
                ${item.budgetTotal?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-gray-500">
                Usado: ${used.toLocaleString()}
              </div>
            </div>
          );
        },
      },
      {
        key: 'startDate',
        title: 'Fechas',
        sortable: true,
        render: (_, item) => (
          <div className="text-xs leading-tight min-w-40">
            <strong>
              {item.startDate
                ? new Date(item.startDate).toLocaleDateString()
                : ''}{' '}
              →{' '}
            </strong>
            <span>
              {item.endDate ? new Date(item.endDate).toLocaleDateString() : ''}
            </span>
          </div>
        ),
      },
      {
        key: 'purchaseOrders',
        title: 'OC / Facturas',
        render: (_, item) => (
          <span className="text-xs font-medium">
            {item?.purchaseOrders?.length || 0} OC
          </span>
        ),
      },
      { key: 'actions', title: 'Acciones' },
    ],
    [],
  );

  const rowActions = (row) => [
    {
      key: 'main',
      label: 'Ver',
      icon: FaEye,
      action: () => navigate(`/projects/view/${row.id}`),
      color: 'blue',
    },
    {
      label: 'Editar',
      action: () => {
        setSelectedProject(row);
        setIsModalOpen(true);
      },
      icon: FaPen,
    },
    {
      label: 'Eliminar',
      action: () => deleteProject(row.id),
      icon: FaTrash,
      color: 'red',
    },
  ];

  return (
    <section className="px-4 py-6 md:px-8 bg-white dark:bg-sinabe-blue-dark rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg md:text-xl font-bold text-sinabe-primary">
          Proyectos
        </h1>
        <div>
          <ActionButtons
            extraActions={[
              {
                label: 'Nuevo Proyecto',
                action: () => setIsModalOpen(true),
                color: 'indigo',
                icon: FaPlus,
              },
            ]}
          />
        </div>
      </div>

      <ProjectSummaryCards projects={projects} />

      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-end mb-6">
        <ProjectSearchBar
          searchTerm={searchTerm || ''}
          setSearchTerm={(term) =>
            updateParams({ ...query, searchTerm: term, page: 1 })
          }
        />

        <div className="flex gap-2 w-full md:w-auto">
          <FilterDropdown
            label="Estado"
            titleDisplay="Estado del Proyecto"
            selected={statuses}
            setSelected={(newStatuses) =>
              updateParams({ ...query, statuses: newStatuses, page: 1 })
            }
            options={[
              { id: 'PLANIFICACION', name: 'Planificación' },
              { id: 'EN_EJECUCION', name: 'En ejecución' },
              { id: 'EN_REVISION', name: 'En revisión' },
              { id: 'FINALIZADO', name: 'Finalizado' },
              { id: 'PAUSADO', name: 'Pausado' },
              { id: 'CANCELADO', name: 'Cancelado' },
            ]}
          />

          <FilterDropdown
            label="Vertical"
            titleDisplay="Verticales"
            selected={verticalIds}
            setSelected={(newVerticals) =>
              updateParams({ ...query, verticalIds: newVerticals, page: 1 })
            }
            options={verticals}
            keyField="id"
            labelField="name"
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton height={400} className="rounded-lg" />
      ) : (
        <ReusableTable
          columns={columns}
          data={projects}
          pagination={pagination}
          loading={isLoading}
          error={error}
          sortConfig={{ key: query.sortBy, direction: query.order }}
          onSort={(key) => {
            const direction =
              query.sortBy === key && query.order === 'asc' ? 'desc' : 'asc';
            updateParams({ ...query, sortBy: key, order: direction });
          }}
          onPageChange={(page) => updateParams({ ...query, page })}
          onPageSizeChange={(size) =>
            updateParams({ ...query, pageSize: size, page: 1 })
          }
          rowActions={rowActions}
          enableCardView={true}
          cardViewConfig={{
            titleKey: 'name',
            subtitleKey: 'provider',
          }}
          rowKey="code"
        />
      )}

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProject(null);
        }}
        initialValues={
          selectedProject
            ? {
                id: selectedProject.id,
                name: selectedProject.name,
                provider: selectedProject.provider,
                budgetTotal: selectedProject.budgetTotal || 0,
                startDate: selectedProject.startDate?.split('T')[0] || '',
                endDate: selectedProject.endDate?.split('T')[0] || '',
                description: selectedProject.description || '',
                status: selectedProject.status || 'PLANIFICACION',
              }
            : {
                name: '',
                provider: '',
                budgetTotal: 0,
                startDate: '',
                endDate: '',
                description: '',
                status: 'PLANIFICACION',
              }
        }
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default ProjectsPage;
