// src/components/ProjectDetails/ProjectMetrics.jsx
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUsers,
  FaBoxOpen,
} from 'react-icons/fa';

const MetricCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 bg-white dark:bg-sinabe-blue-dark p-4 rounded-md border border-gray-200 dark:border-gray-700">
    <div className="text-sinabe-primary text-xl">
      <Icon />
    </div>
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
        {label}
      </div>
      <div className="text-sm font-semibold text-gray-800 dark:text-white">
        {value}
      </div>
    </div>
  </div>
);

const ProjectMetrics = ({ project }) => {
  return (
    <>
      <MetricCard
        icon={FaMoneyBillWave}
        label="Presupuesto Total"
        value={`$${project.budgetTotal.toLocaleString()}`}
      />
      <MetricCard
        icon={FaCalendarAlt}
        label="Fechas del Proyecto"
        value={`${new Date(project.startDate).toLocaleDateString()} → ${new Date(project.endDate).toLocaleDateString()}`}
      />
      <MetricCard
        icon={FaBoxOpen}
        label="Inventario Asignado"
        value={`Próximamente`}
      />
      <MetricCard
        icon={FaUsers}
        label="Miembros del Equipo"
        value={`Próximamente`}
      />
    </>
  );
};

export default ProjectMetrics;
