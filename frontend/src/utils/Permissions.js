export const PermissionsByGroup = {
  inventories: {
    name: 'Inventarios',
    permissions: [
      'view_inventories',
      'view_self_inventories',
      'create_inventories',
      'edit_inventories',
      'delete_inventories',
    ],
  },
  inventoryConditions: {
    name: 'Condiciones de los inventarios',
    permissions: [
      'view_inventories_conditions',
      'create_inventories_conditions',
      'edit_inventories_conditions',
      'delete_inventories_conditions',
    ],
  },
  inventoryBrands: {
    name: 'Marcas de los Inventarios',
    permissions: [
      'view_inventories_brands',
      'create_inventories_brands',
      'edit_inventories_brands',
      'delete_inventories_brands',
    ],
  },
  inventoryModels: {
    name: 'Modelos de Inventarios',
    permissions: [
      'view_inventories_models',
      'create_inventories_models',
      'edit_inventories_models',
      'delete_inventories_models',
    ],
  },
  inventoryTypes: {
    name: 'Tipos de Inventarios',
    permissions: [
      'view_inventories_types',
      'create_inventories_types',
      'edit_inventories_types',
      'delete_inventories_types',
    ],
  },
  users: {
    name: 'Usuarios',
    permissions: ['view_users', 'create_users', , 'edit_users', 'delete_users'],
  },
  roles: {
    name: 'Roles',
    permissions: ['view_roles', 'create_roles', 'edit_roles', 'delete_roles'],
  },
  account: {
    name: 'Configuracion de la cuenta',
    permissions: [
      'view_account',
      'edit_account',
      'change_password',
      'change_account_image',
    ],
  },
  dashboard: {
    name: 'Dashboard',
    permissions: ['view_dashboard'],
  },
};
