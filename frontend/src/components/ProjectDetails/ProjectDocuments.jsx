// File: frontend/src/components/ProjectDetails/ProjectDocuments.jsx

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import ProjectDocumentsViewer from './Document/ProjectDocumentsViewer';
import { useProjectDocuments } from '../../hooks/useProjectDocuments';

const ProjectDocuments = ({ projectId }) => {
  const {
    data: documents = [],
    isLoading,
    isError,
    refetch,
  } = useProjectDocuments(projectId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton height={30} count={1} />
        <Skeleton height={200} count={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-600 text-center">
        Error al cargar los documentos del proyecto.
      </div>
    );
  }

  return (
    <ProjectDocumentsViewer
      documents={documents}
      projectId={projectId}
      onRefresh={refetch}
    />
  );
};

export default ProjectDocuments;
