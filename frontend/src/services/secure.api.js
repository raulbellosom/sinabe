import api from '../lib/api/client';

export const getRoles = async () => {
  try {
    const { data } = await api.get('/roles');
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRoleById = async (id) => {
  try {
    const { data } = await api.get(`/roles/${id}`);
    return data;
  } catch (error) {
    console.log(error);

    throw error;
  }
};

export const createRole = async (role) => {
  try {
    const { data } = await api.post('/roles', role);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateRole = async (role) => {
  try {
    const { data } = await api.put(`/roles/${role.id}`, role);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteRole = async (id) => {
  try {
    await api.delete(`/roles/${id}`);
    return id;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getPermissions = async () => {
  try {
    const { data } = await api.get('/permissions');
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getPermissionById = async (id) => {
  try {
    const { data } = await api.get(`/permissions/${id}`);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createPermission = async (permission) => {
  try {
    const { data } = await api.post('/permissions', permission);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updatePermission = async (permission) => {
  try {
    const { data } = await api.put(`/permissions/${permission.id}`, permission);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deletePermission = async (id) => {
  try {
    const { data } = await api.delete(`/permissions/${id}`);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const syncPermissions = async (permissions) => {
  try {
    const { data } = await api.post('/permissions/sync', { permissions });
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRolePermissions = async () => {
  try {
    const { data } = await api.get('/role-permissions');
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRolePermissionByRoleId = async (roleId) => {
  try {
    const { data } = await api.get(`/role-permissions/role/${roleId}`);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createRolePermission = async (rolePermission) => {
  try {
    const { data } = await api.post('/role-permissions/add', rolePermission);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const deleteRolePermission = async (rolePermission) => {
  try {
    const { data } = await api.post('/role-permissions/remove', rolePermission);
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
