import {
  ClipboardList,
  FileText,
  Network,
  UserCircle,
  UserCog,
  ShieldCheck,
  Home,
  ListChecks,
  Package,
  Layers,
  LayoutGrid,
  FolderKanban,
  SlidersHorizontal,
  History,
} from 'lucide-react';

const BreadcrumbsBuilder = (path) => {
  // No mostrar breadcrumbs en home o dashboard
  if (path === '/' || path === '/dashboard') {
    return [];
  }

  // Extraemos solo la parte base de la ruta para los breadcrumbs
  // Ejemplo: '/purchase-orders/3d9439b5-9511-48ed-89c8-854cdf165897/invoices' => '/purchase-orders/invoices'
  // eslint-disable-next-line no-unused-vars
  const getBasePath = (fullPath) => {
    // UUID regex más preciso para capturar UUIDs completos
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const parts = fullPath.split('/').filter(Boolean);
    let baseParts = [];

    for (let i = 0; i < parts.length; i++) {
      // Si es un UUID, lo saltamos
      if (uuidRegex.test(parts[i])) {
        continue;
      }
      baseParts.push(parts[i]);
    }

    return '/' + baseParts.join('/');
  };

  // Lista de rutas y sus datos para los breadcrumbs
  const breadcrumbs = [
    {
      label: 'Inventarios',
      href: '/inventories',
      icon: Package,
    },
    {
      label: 'Crear',
      href: '/inventories/create',
      icon: Layers,
    },
    {
      label: 'Editar',
      href: '/inventories/edit',
    },
    {
      label: 'Detalles',
      href: '/inventories/view',
      icon: ListChecks,
    },
    {
      label: 'Migrar',
      href: '/inventories/migrate',
      icon: Home,
    },
    {
      label: 'Resguardos',
      href: '/custody',
      icon: FileText,
    },
    {
      label: 'Crear',
      href: '/custody/create',
      icon: Layers,
    },
    {
      label: 'Verticales',
      href: '/verticals',
      icon: Network,
    },
    {
      label: 'Proyectos',
      href: '/projects',
      icon: FolderKanban,
    },
    {
      label: 'Detalles del Proyecto',
      href: '/projects/view',
      icon: ListChecks,
    },
    {
      label: 'Crear Proyecto',
      href: '/projects/create',
      icon: Layers,
    },
    {
      label: 'Editar Proyecto',
      href: '/projects/edit',
      icon: null,
    },
    {
      label: 'Órdenes de Compra',
      href: '/purchase-orders',
      icon: ClipboardList,
    },
    {
      label: 'Facturas',
      href: '/invoices',
      icon: FileText,
    },
    {
      label: 'Crear',
      href: '/purchase-orders/create',
      icon: Layers,
    },
    {
      label: 'Editar',
      href: '/purchase-orders/edit',
      icon: null,
    },
    {
      label: 'Catalogos',
      href: '/catalogs',
      icon: LayoutGrid,
    },
    {
      label: 'Crear',
      href: '/catalogs/inventory-models/create',
      icon: null,
    },
    {
      label: 'Editar',
      href: '/catalogs/inventory-models/edit',
      icon: null,
    },
    {
      label: 'Usuarios',
      href: '/users',
      icon: UserCircle,
    },
    {
      label: 'Crear',
      href: '/users/create',
      icon: null,
    },
    {
      label: 'Editar',
      href: '/users/edit',
      icon: null,
    },
    {
      label: 'Detalles',
      href: '/users/view',
      icon: null,
    },
    {
      label: 'Mi Perfil',
      href: '/account-settings',
      icon: UserCog,
    },
    {
      label: 'Preferencias',
      href: '/preferences',
      icon: SlidersHorizontal,
    },
    {
      label: 'Control de roles',
      href: '/roles',
      icon: ShieldCheck,
    },
    {
      label: 'Agenda',
      href: '/agenda',
      icon: null,
    },
    {
      label: 'Auditoría',
      href: '/audit-logs',
      icon: History,
    },
  ];

  const pathArray = path.split('/').filter((item) => item);

  // Crear un array de rutas progresivas, pero excluyendo UUIDs para matching
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  const newPathArray = [];
  let currentPath = '';
  let actualPath = '';

  pathArray.forEach((segment) => {
    actualPath += `/${segment}`;

    if (!uuidRegex.test(segment)) {
      currentPath += `/${segment}`;
      newPathArray.push({
        matchPath: currentPath,
        actualPath: actualPath,
      });
    }
  });

  let breadcrumb = [];

  newPathArray.forEach((pathInfo) => {
    const found = breadcrumbs.find(
      (breadcrumb) => breadcrumb.href === pathInfo.matchPath,
    );
    if (found) {
      // Usar la ruta actual (con UUID) en lugar de la ruta de matching
      breadcrumb.push({
        ...found,
        href: pathInfo.actualPath,
      });
    }
  });

  return breadcrumb;
};

export default BreadcrumbsBuilder;
