export const PermissionsByGroup = {
  inventories: {
    name: 'Inventarios',
    permissions: [
      'view_inventories',
      'view_self_inventories',
      'create_inventories',
      'edit_inventories',
      'delete_inventories',
      'export_inventories',
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
  inventoryLocations: {
    name: 'Ubicaciones de Inventarios',
    permissions: [
      'view_inventories_locations',
      'create_inventories_locations',
      'edit_inventories_locations',
      'delete_inventories_locations',
    ],
  },
  inventoryCustomFields: {
    name: 'Campos personalizados de Inventarios',
    permissions: [
      'view_inventories_custom_fields',
      'create_inventories_custom_fields',
      'edit_inventories_custom_fields',
      'delete_inventories_custom_fields',
    ],
  },
  custodies: {
    name: 'Resguardos',
    permissions: [
      'view_custodies',
      'create_custodies',
      'edit_custodies',
      'delete_custodies',
      'sign_custodies',
    ],
  },
  projects: {
    name: 'Proyectos',
    permissions: [
      'view_projects',
      'create_projects',
      'edit_projects',
      'delete_projects',
    ],
  },
  deadlines: {
    name: 'Entregables',
    permissions: [
      'view_deadlines',
      'create_deadlines',
      'edit_deadlines',
      'delete_deadlines',
    ],
  },
  purchaseOrders: {
    name: 'Órdenes de compra',
    permissions: [
      'view_purchase_orders',
      'create_purchase_orders',
      'edit_purchase_orders',
      'delete_purchase_orders',
    ],
  },
  invoices: {
    name: 'Facturas',
    permissions: [
      'view_invoices',
      'create_invoices',
      'edit_invoices',
      'delete_invoices',
    ],
  },
  verticals: {
    name: 'Verticales',
    permissions: [
      'view_verticals',
      'create_verticals',
      'edit_verticals',
      'delete_verticals',
    ],
  },
  events: {
    name: 'Eventos y Mantenimientos',
    permissions: [
      'view_events',
      'create_events',
      'edit_events',
      'delete_events',
    ],
  },
  notifications: {
    name: 'Notificaciones',
    permissions: [
      'view_notifications',
      'create_notification_rules',
      'edit_notification_rules',
      'delete_notification_rules',
    ],
  },
  audit: {
    name: 'Auditoría',
    permissions: ['view_audit_logs'],
  },
  ai: {
    name: 'Asistente IA',
    permissions: ['use_ai_assistant'],
  },
  users: {
    name: 'Usuarios',
    permissions: ['view_users', 'create_users', 'edit_users', 'delete_users'],
  },
  roles: {
    name: 'Roles',
    permissions: [
      'view_roles',
      'create_roles',
      'edit_roles',
      'delete_roles',
      'manage_permissions',
    ],
  },
  account: {
    name: 'Configuración de la cuenta',
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

// Flat list of all permission definitions (for sync operations)
export const getAllPermissionDefinitions = () => {
  const descriptionMap = {
    // Inventories
    view_inventories: 'Ver inventarios',
    view_self_inventories: 'Ver mis inventarios',
    create_inventories: 'Crear inventarios',
    edit_inventories: 'Editar inventarios',
    delete_inventories: 'Eliminar inventarios',
    export_inventories: 'Exportar inventarios',
    // Conditions
    view_inventories_conditions: 'Ver condiciones de inventarios',
    create_inventories_conditions: 'Crear condiciones de inventarios',
    edit_inventories_conditions: 'Editar condiciones de inventarios',
    delete_inventories_conditions: 'Eliminar condiciones de inventarios',
    // Brands
    view_inventories_brands: 'Ver marcas de inventarios',
    create_inventories_brands: 'Crear marcas de inventarios',
    edit_inventories_brands: 'Editar marcas de inventarios',
    delete_inventories_brands: 'Eliminar marcas de inventarios',
    // Models
    view_inventories_models: 'Ver modelos de inventarios',
    create_inventories_models: 'Crear modelos de inventarios',
    edit_inventories_models: 'Editar modelos de inventarios',
    delete_inventories_models: 'Eliminar modelos de inventarios',
    // Types
    view_inventories_types: 'Ver tipos de inventarios',
    create_inventories_types: 'Crear tipos de inventarios',
    edit_inventories_types: 'Editar tipos de inventarios',
    delete_inventories_types: 'Eliminar tipos de inventarios',
    // Locations
    view_inventories_locations: 'Ver ubicaciones de inventarios',
    create_inventories_locations: 'Crear ubicaciones de inventarios',
    edit_inventories_locations: 'Editar ubicaciones de inventarios',
    delete_inventories_locations: 'Eliminar ubicaciones de inventarios',
    // Custom fields
    view_inventories_custom_fields: 'Ver campos personalizados de inventarios',
    create_inventories_custom_fields:
      'Crear campos personalizados de inventarios',
    edit_inventories_custom_fields: 'Editar campos personalizados de inventarios',
    delete_inventories_custom_fields:
      'Eliminar campos personalizados de inventarios',
    // Custodies
    view_custodies: 'Ver resguardos',
    create_custodies: 'Crear resguardos',
    edit_custodies: 'Editar resguardos',
    delete_custodies: 'Eliminar resguardos',
    sign_custodies: 'Firmar resguardos',
    // Projects
    view_projects: 'Ver proyectos',
    create_projects: 'Crear proyectos',
    edit_projects: 'Editar proyectos',
    delete_projects: 'Eliminar proyectos',
    // Deadlines
    view_deadlines: 'Ver entregables',
    create_deadlines: 'Crear entregables',
    edit_deadlines: 'Editar entregables',
    delete_deadlines: 'Eliminar entregables',
    // Purchase orders
    view_purchase_orders: 'Ver órdenes de compra',
    create_purchase_orders: 'Crear órdenes de compra',
    edit_purchase_orders: 'Editar órdenes de compra',
    delete_purchase_orders: 'Eliminar órdenes de compra',
    // Invoices
    view_invoices: 'Ver facturas',
    create_invoices: 'Crear facturas',
    edit_invoices: 'Editar facturas',
    delete_invoices: 'Eliminar facturas',
    // Verticals
    view_verticals: 'Ver verticales',
    create_verticals: 'Crear verticales',
    edit_verticals: 'Editar verticales',
    delete_verticals: 'Eliminar verticales',
    // Events
    view_events: 'Ver eventos y mantenimientos',
    create_events: 'Crear eventos y mantenimientos',
    edit_events: 'Editar eventos y mantenimientos',
    delete_events: 'Eliminar eventos y mantenimientos',
    // Notifications
    view_notifications: 'Ver notificaciones',
    create_notification_rules: 'Crear reglas de notificación',
    edit_notification_rules: 'Editar reglas de notificación',
    delete_notification_rules: 'Eliminar reglas de notificación',
    // Audit
    view_audit_logs: 'Ver registros de auditoría',
    // AI
    use_ai_assistant: 'Usar asistente de IA',
    // Users
    view_users: 'Ver usuarios',
    create_users: 'Crear usuarios',
    edit_users: 'Editar usuarios',
    delete_users: 'Eliminar usuarios',
    // Roles
    view_roles: 'Ver roles',
    create_roles: 'Crear roles',
    edit_roles: 'Editar roles',
    delete_roles: 'Eliminar roles',
    manage_permissions: 'Gestionar permisos del sistema',
    // Account
    view_account: 'Ver la cuenta',
    edit_account: 'Editar información de la cuenta',
    change_password: 'Cambiar contraseña',
    change_account_image: 'Cambiar imagen de perfil',
    // Dashboard
    view_dashboard: 'Ver el panel de control',
  };

  const all = [];
  Object.values(PermissionsByGroup).forEach((group) => {
    group.permissions.forEach((name) => {
      all.push({
        name,
        description: descriptionMap[name] || name,
        group: group.name,
      });
    });
  });
  return all;
};

