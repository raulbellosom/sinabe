// src/components/ProjectDetails/ProjectTimeline.jsx
import { FaCircle } from 'react-icons/fa';

const TIMELINE_COLORS = [
  'text-purple-600',
  'text-green-600',
  'text-blue-600',
  'text-orange-500',
  'text-yellow-500',
  'text-red-600',
];

const ProjectTimeline = ({ projectId }) => {
  // Simulación temporal de eventos (esto se puede cargar vía hook/API real)
  const timeline = [
    { title: 'Inicio del proyecto', date: '2025-01-15' },
    { title: 'Primera OC aprobada', date: '2025-01-20' },
    { title: 'Recepción de equipos', date: '2025-01-25' },
    { title: 'Inicio de instalación', date: '2025-03-05' },
    { title: '50% de cámaras instaladas', date: '2025-03-25' },
    { title: 'Deadline instalación', date: '2025-04-15' },
  ];

  return (
    <div className="bg-white dark:bg-sinabe-blue-dark p-6 space-y-4 rounded-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Timeline del Proyecto
      </h2>

      <ul className="space-y-4">
        {timeline.map((event, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span
              className={`pt-1 text-sm ${TIMELINE_COLORS[idx % TIMELINE_COLORS.length]}`}
            >
              <FaCircle />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {event.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(event.date).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectTimeline;
