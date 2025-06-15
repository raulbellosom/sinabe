import api from './api'; // Asegúrate que `api` tiene la configuración base de Axios

// Asignar un inventario a una deadline
export const assignInventoryToDeadline = async ({
  deadlineId,
  inventoryId,
  quantity,
}) => {
  const response = await api.post('/inventory-assignments/assign', {
    deadlineId,
    inventoryId,
    quantity,
  });
  return response.data;
};

// Obtener los inventarios asignados a una deadline
export const getInventoryAssignmentsByDeadline = async (deadlineId) => {
  const response = await api.get(
    `/inventory-assignments/deadline/${deadlineId}`,
  );
  return response.data;
};

// Eliminar una asignación (soft delete)
export const unassignInventoryFromDeadline = async (assignmentId) => {
  const response = await api.put(
    `/inventory-assignments/unassign/${assignmentId}`,
  );
  return response.data;
};
