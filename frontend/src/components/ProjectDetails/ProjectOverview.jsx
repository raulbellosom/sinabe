import ProjectStatusBadge from '../Projects/ProjectStatusBadge';

// src/components/ProjectDetails/ProjectOverview.jsx
const ProjectOverview = ({ project }) => {
  return (
    <div className="bg-white dark:bg-sinabe-blue-dark p-6 space-y-4 mb-6 rounded-md border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
            Clave del Proyecto
          </div>
          <div className="text-base font-bold text-sinabe-primary">
            {project.code}
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
            Proveedor
          </div>
          <div className="font-semibold text-gray-800 dark:text-white">
            {project.provider}
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
            Estado
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
            Verticales
          </div>
          <div className="flex flex-wrap gap-1">
            {(project.verticals?.length > 0 &&
              project.verticals?.map((v, i) => (
                <span
                  key={i}
                  className="bg-sinabe-primary/10 text-sinabe-primary text-xs font-medium px-2 py-0.5 rounded-md"
                >
                  {v.name}
                </span>
              ))) || (
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-2 py-0.5 rounded-full text-xs">
                Sin verticales
              </span>
            )}
          </div>
        </div>
      </div>

      {project.description && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Descripción del Proyecto
          </h2>
          <p className="text-sm whitespace-pre-line text-gray-700 dark:text-gray-200 leading-relaxed">
            {project.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;
