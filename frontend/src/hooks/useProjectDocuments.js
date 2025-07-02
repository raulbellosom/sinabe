import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  uploadProjectDocument,
  getProjectDocuments,
  deleteProjectDocument,
  updateProjectDocument,
} from '../services/projectDocuments.api';

// 📄 Obtener documentos por proyecto
export const useProjectDocuments = (projectId) =>
  useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: () => getProjectDocuments(projectId).then((res) => res.data),
    enabled: !!projectId,
  });

// 📤 Subir documento (requiere FormData en el componente)
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

// 📄 Actualizar documento (admite FormData o estructura plana)
export const useUpdateProjectDocument = (projectId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.description !== undefined)
        formData.append('description', data.description);
      if (data.file) formData.append('documento', data.file); // ← nombre esperado por multer

      return updateProjectDocument(id, formData);
    },
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
