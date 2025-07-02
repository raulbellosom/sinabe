import api from './api';

// Obtener documentos del proyecto
export const getProjectDocuments = (projectId) =>
  api.get(`/project-documents/${projectId}/documents`);

// Subir un nuevo documento al proyecto
export const uploadProjectDocument = (projectId, formData) =>
  api.post(`/project-documents/${projectId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Actualizar documento (nombre, descripción o archivo)
export const updateProjectDocument = (id, formData) => {
  const isFormData = formData instanceof FormData;
  return api.put(`/project-documents/documents/${id}`, formData, {
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  });
};

// Eliminar documento lógicamente
export const deleteProjectDocument = (id) =>
  api.delete(`/project-documents/documents/${id}`);
