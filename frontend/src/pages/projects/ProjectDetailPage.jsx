// src/pages/ProjectDetailPage.jsx
import { useParams, useSearchParams } from 'react-router-dom';
import { useProjectSummary } from '../../hooks/useProjects';
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
import ProjectInventory from '../../components/ProjectDetails/ProjectInventory';
import ProjectPurchaseOrders from '../../components/ProjectDetails/ProjectPurchaseOrders';
import ProjectStatusBadge from '../../components/Projects/ProjectStatusBadge';
import ProjectDocuments from '../../components/ProjectDetails/ProjectDocuments';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabIndex = parseInt(searchParams.get('tab')) || 0;
  const { data: project, isLoading } = useProjectSummary(id);

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
      content: <ProjectInventory projectId={project.id} />,
    },
    {
      title: 'Órdenes de Compra',
      icon: FaClipboardList,
      content: <ProjectPurchaseOrders projectId={project.id} />,
    },
    {
      title: 'Equipo',
      icon: FaUsers,
      content: <ProjectTeamList projectId={project.id} />,
    },
    {
      title: 'Documentos',
      icon: FaFileAlt,
      content: <ProjectDocuments projectId={project.id} />,
    },
  ];

  return (
    <section className="w-full p-4 bg-white dark:bg-sinabe-blue-dark rounded-lg shadow-md overflow-hidden">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-sinabe-primary">
          {project.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="text-xs uppercase tracking-widest">
            {project.code}
          </span>
          <span className="text-gray-400">·</span>
          <span className="font-medium">{project.provider}</span>
          <span className="text-gray-400">·</span>

          <ProjectStatusBadge status={project.status} />
          <span className="text-gray-400">·</span>
          {project.verticals?.slice(0, 3).map((v, i) => (
            <span
              key={i}
              className="bg-sinabe-primary/10 text-sinabe-primary text-xs font-medium px-2 py-0.5 rounded-md"
            >
              {v.name}
            </span>
          ))}
          {project.verticals && project.verticals.length > 3 && (
            <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-md">
              +{project.verticals.length - 3}
            </span>
          )}
        </div>
      </div>

      <CustomTabs
        tabs={tabs}
        initialIndex={tabIndex}
        onTabChange={(index) => {
          setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('tab', index.toString());
            return newParams;
          });
        }}
      />
    </section>
  );
};

export default ProjectDetailPage;
