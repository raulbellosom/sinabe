// src/pages/ProjectsPage.jsx
import { useMemo, useState } from 'react';
import { useProjectSearch } from '../../hooks/useProjectSearch';
import { useCreateProject, useProjects } from '../../hooks/useProjects';
import Skeleton from 'react-loading-skeleton';
import ProjectSummaryCards from '../../components/Projects/ProjectSummaryCards';
import ProjectTable from '../../components/Projects/ProjectTable';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { FaPlus } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce';
import ProjectSearchBar from '../../components/Projects/ProjectSearchBar';
import ProjectFilters from '../../components/Projects/ProjectFilters';
import { useProjectVerticals } from '../../hooks/useProjectVerticals';
import ProjectFormModal from '../../components/Projects/ProjectFormModal';
import Notifies from '../../components/Notifies/Notifies';

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    statuses: [],
    verticalIds: [],
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [order, setOrder] = useState('desc');

  const debouncedSearch = useDebounce(searchTerm, 400);

  const { verticals = [], createVertical } = useProjectVerticals();
  const { data: allProjects, isLoading: isLoadingAll } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutateAsync: createProject } = useCreateProject();

  const { data: projectsData, isLoading } = useProjectSearch({
    searchTerm: debouncedSearch,
    filters,
    pagination: { page, pageSize },
    sorting: { sortBy, order },
  });

  const { projects = [], total = 0 } = projectsData || {};

  const handleCreateSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createProject(values);
      resetForm();
      Notifies('success', 'Proyecto creado correctamente');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error al crear proyecto', error);
      Notifies(
        'error',
        error?.response?.data?.message || 'Error al crear proyecto',
      );
    } finally {
      setSubmitting(false);
    }
  };

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

      {isLoadingAll ? (
        <Skeleton height={120} count={1} className="mb-6 rounded-lg" />
      ) : (
        <>
          <ProjectSummaryCards projects={allProjects || []} />
          <div className="flex items-center justify-start w-full gap-4 mb-6">
            <ProjectFilters
              verticals={verticals || []}
              filters={filters}
              setFilters={setFilters}
            />
            <ProjectSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        </>
      )}

      {isLoading ? (
        <Skeleton height={400} className="rounded-lg" />
      ) : (
        <ProjectTable
          projects={projects}
          isLoading={isLoading}
          sortBy={sortBy}
          order={order}
          onSortChange={(newSort) => {
            if (newSort === sortBy) {
              setOrder(order === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy(newSort);
              setOrder('asc');
            }
          }}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1); // Reiniciar al cambiar tamaño
          }}
        />
      )}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialValues={{
          name: '',
          provider: '',
          budgetTotal: 0,
          verticalIds: [],
          startDate: '',
          endDate: '',
          description: '',
          status: 'PLANIFICACION',
        }}
        onSubmit={handleCreateSubmit}
        verticals={verticals || []}
        createVertical={createVertical}
      />
    </section>
  );
};

export default ProjectsPage;
