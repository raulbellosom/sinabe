// src/pages/ProjectsPage.jsx
import { useState } from 'react';
import { useProjectSearch } from '../../hooks/useProjectSearch';
import { useProjects } from '../../hooks/useProjects';
import Skeleton from 'react-loading-skeleton';
import ProjectSummaryCards from '../../components/Projects/ProjectSummaryCards';
import ProjectTable from '../../components/Projects/ProjectTable';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { FaPlus } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce';

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data: allProjects, isLoading: isLoadingAll } = useProjects();
  const { data: projects, isLoading } = useProjectSearch(debouncedSearch);

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
                href: '/projects/create',
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
        <ProjectSummaryCards projects={allProjects || []} />
      )}

      {isLoading ? (
        <Skeleton height={400} className="rounded-lg" />
      ) : (
        <ProjectTable
          projects={projects || []}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}
    </section>
  );
};

export default ProjectsPage;
