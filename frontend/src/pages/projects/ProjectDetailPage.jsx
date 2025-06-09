// src/pages/ProjectDetailPage.jsx
import { useParams } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ProjectOverview from '../../components/ProjectDetails/ProjectOverview';
import ProjectMetrics from '../../components/ProjectDetails/ProjectMetrics';
import ProjectTimeline from '../../components/ProjectDetails/ProjectTimeline';
import CustomTabs from '../../components/ProjectDetails/CustomTabs';
import {
  FaFileAlt,
  FaBox,
  FaCalendarCheck,
  FaClipboardList,
  FaUsers,
} from 'react-icons/fa';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { data: project, isLoading } = useProject(id);

  if (isLoading || !project) {
    return (
      <section className="px-4 py-6 md:px-8">
        <Skeleton height={40} width={300} className="mb-6" />
        <Skeleton height={400} />
      </section>
    );
  }

  const tabs = [
    {
      title: 'Resumen',
      icon: FaFileAlt,
      content: (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <ProjectMetrics project={project} />
          </div>
          <ProjectOverview project={project} />
          <ProjectTimeline projectId={project.id} />
        </>
      ),
    },
    {
      title: 'Deadlines',
      icon: FaCalendarCheck,
      content: <p>Próximamente: Gestión de deadlines del proyecto.</p>,
    },
    {
      title: 'Inventario',
      icon: FaBox,
      content: <p>Próximamente: Inventario asignado al proyecto.</p>,
    },
    {
      title: 'Órdenes de Compra',
      icon: FaClipboardList,
      content: <p>Próximamente: Listado de órdenes de compra y facturas.</p>,
    },
    {
      title: 'Equipo',
      icon: FaUsers,
      content: <p>Próximamente: Miembros del equipo asignado al proyecto.</p>,
    },
  ];

  return (
    <section className="w-full px-4 py-6 md:px-8 bg-white dark:bg-sinabe-blue-dark rounded-lg shadow-md overflow-hidden">
      <h1 className="text-base md:text-xl font-bold text-sinabe-primary mb-4">
        {project.code} - {project.name}
      </h1>

      <CustomTabs tabs={tabs} />
    </section>
  );
};

export default ProjectDetailPage;
