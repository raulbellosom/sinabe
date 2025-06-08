// src/pages/ProjectDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../hooks/useProjects';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Tabs } from 'flowbite-react';
import {
  FaFileAlt,
  FaClipboardList,
  FaBox,
  FaCalendarCheck,
  FaUsers,
} from 'react-icons/fa';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading } = useProject(id);

  if (isLoading || !project) {
    return (
      <section className="px-4 py-6 md:px-8">
        <Skeleton height={40} width={300} className="mb-6" />
        <Skeleton height={400} />
      </section>
    );
  }

  return (
    <section className="overflow-hidden w-full px-4 py-6 md:px-8 bg-white dark:bg-sinabe-blue-dark rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-base md:text-xl font-bold text-sinabe-primary">
          {project.code} - {project.name}
        </h1>
      </div>
      <div className="overflow-x-auto">
        <Tabs variant="fullWidth">
          <Tabs.Item title="Resumen" icon={FaFileAlt}>
            <div className="space-y-4 text-sm">
              <div>
                <strong>Proveedor:</strong> {project.provider}
              </div>
              <div>
                <strong>Estado:</strong> {project.status}
              </div>
              <div>
                <strong>Presupuesto:</strong> $
                {project.budgetTotal.toLocaleString()}
              </div>
              <div>
                <strong>Fechas:</strong>{' '}
                {new Date(project.startDate).toLocaleDateString()} →{' '}
                {new Date(project.endDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Verticales:</strong>{' '}
                {project.verticals.map((v, i) => (
                  <span
                    key={i}
                    className="inline-block bg-sinabe-blue-dark text-white px-2 py-1 rounded-full text-xs mr-2"
                  >
                    {v.name}
                  </span>
                ))}
              </div>
            </div>
          </Tabs.Item>

          <Tabs.Item title="Deadlines" icon={FaCalendarCheck}>
            <p>Próximamente: Gestión de deadlines del proyecto.</p>
          </Tabs.Item>

          <Tabs.Item title="Inventario" icon={FaBox}>
            <p>Próximamente: Inventario asignado al proyecto.</p>
          </Tabs.Item>

          <Tabs.Item title="Órdenes de Compra" icon={FaClipboardList}>
            <p>Próximamente: Listado de órdenes de compra y facturas.</p>
          </Tabs.Item>

          <Tabs.Item title="Equipo" icon={FaUsers}>
            <p>Próximamente: Miembros del equipo asignado al proyecto.</p>
          </Tabs.Item>
        </Tabs>
      </div>
    </section>
  );
};

export default ProjectDetailPage;
