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
import ProjectDeadlines from '../../components/ProjectDetails/ProjectDeadlines';
import ProjectTeamList from '../../components/ProjectDetails/Team/ProjectTeamList';

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      content: <ProjectDeadlines projectId={project.id} />,
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
      content: <ProjectTeamList projectId={project.id} />,
    },
    {
      title: 'Documentos',
      icon: FaFileAlt,
      content: <p>Próximamente: Documentos y archivos del proyecto.</p>,
    },
  ];

  return (
    <section className="w-full px-4 py-6 md:px-8 bg-white dark:bg-sinabe-blue-dark rounded-lg shadow-md overflow-hidden">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-sinabe-primary">
          {project.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium">{project.provider}</span>
          <span className="text-gray-400">·</span>
          {project.verticals?.map((v, i) => (
            <span
              key={i}
              className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-2 py-0.5 rounded-full text-xs"
            >
              {v.name}
            </span>
          ))}
          <span className="text-gray-400">·</span>
          <span className="text-xs uppercase tracking-widest">
            {project.code}
          </span>
          <span className="text-gray-400">·</span>
          <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {project.status}
          </span>
        </div>
      </div>

      <CustomTabs tabs={tabs} />
    </section>
  );
};

export default ProjectDetailPage;
