import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadProjectDocument,
  getProjectDocuments,
  deleteProjectDocument,
} from '../services/projectDocuments.api';

// 📄 Obtener documentos por proyecto
export const useProjectDocuments = (projectId) =>
  useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: () => getProjectDocuments(projectId).then((res) => res.data),
    enabled: !!projectId,
  });

// 📤 Subir documento
export const useUploadProjectDocument = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => uploadProjectDocument(projectId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-documents', projectId],
      });
    },
  });
};

// ❌ Eliminar documento
export const useDeleteProjectDocument = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProjectDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-documents', projectId],
      });
    },
  });
};
