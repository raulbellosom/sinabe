const colors = {
  'En Progreso': 'bg-sinabe-primary',
  Planificación: 'bg-sinabe-warning text-black',
  Completado: 'bg-sinabe-success',
};

const ProjectStatusBadge = ({ status }) => {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full text-white whitespace-nowrap ${
        colors[status] || 'bg-sinabe-gray-dark'
      }`}
    >
      {status}
    </span>
  );
};

export default ProjectStatusBadge;
