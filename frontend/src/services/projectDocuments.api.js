import api from './api';

// 📤 Subir documento a un proyecto
export const uploadProjectDocument = (projectId, formData) =>
  api.post(`/projects/${projectId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// 📄 Obtener documentos de un proyecto
export const getProjectDocuments = (projectId) =>
  api.get(`/projects/${projectId}/documents`);

// ❌ Eliminar documento (lógica)
export const deleteProjectDocument = (id) => api.delete(`/documents/${id}`);
