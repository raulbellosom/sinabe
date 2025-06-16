// src/components/Projects/ProjectStatusBadge.jsx
const statusColorMap = {
  PLANIFICACION: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  EN_EJECUCION: 'bg-blue-100 text-blue-800 border-blue-400',
  EN_REVISION: 'bg-purple-100 text-purple-800 border-purple-400',
  FINALIZADO: 'bg-green-100 text-green-800 border-green-400',
  CANCELADO: 'bg-red-100 text-red-800 border-red-400',
  PAUSADO: 'bg-gray-200 text-gray-800 border-gray-400',
};

const ProjectStatusBadge = ({ status }) => {
  const key = status?.toUpperCase()?.replace(/\s/g, '_');
  const classes =
    statusColorMap[key] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <span
      className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${classes}`}
    >
      {status?.replace(/_/g, ' ') || 'Sin estado'}
    </span>
  );
};

export default ProjectStatusBadge;
