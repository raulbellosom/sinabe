import {
  FaClipboardList,
  FaFileInvoice,
  FaSitemap,
  FaUserCircle,
  FaUserCog,
  FaUserShield,
} from 'react-icons/fa';
import { HiHome } from 'react-icons/hi';
import { MdChecklist, MdInventory } from 'react-icons/md';
import { PiStackPlusFill } from 'react-icons/pi';
import { BiCategory } from 'react-icons/bi';
import { AiOutlineProject } from 'react-icons/ai';

const BreadcrumbsBuilder = (path) => {
  // No mostrar breadcrumbs en home o dashboard
  if (path === '/' || path === '/dashboard') {
    return [];
  }

  // Extraemos solo la parte base de la ruta para los breadcrumbs
  // Ejemplo: '/purchase-orders/3d9439b5-9511-48ed-89c8-854cdf165897/invoices' => '/purchase-orders/invoices'
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
      icon: MdInventory,
    },
    {
      label: 'Crear Inventarios',
      href: '/inventories/create',
      icon: PiStackPlusFill,
    },
    {
      label: 'Editar Inventarios',
      href: '/inventories/edit',
    },
    {
      label: 'Detalles del Inventarios',
      href: '/inventories/view',
      icon: MdChecklist,
    },
    {
      label: 'Migrar Inventarios',
      href: '/inventories/migrate',
      icon: HiHome,
    },
    {
      label: 'Verticales',
      href: '/verticals',
      icon: FaSitemap,
    },
    {
      label: 'Proyectos',
      href: '/projects',
      icon: AiOutlineProject,
    },
    {
      label: 'Detalles del Proyecto',
      href: '/projects/view',
      icon: MdChecklist,
    },
    {
      label: 'Crear Proyecto',
      href: '/projects/create',
      icon: PiStackPlusFill,
    },
    {
      label: 'Editar Proyecto',
      href: '/projects/edit',
      icon: null,
    },
    {
      label: 'Órdenes de Compra',
      href: '/purchase-orders',
      icon: FaClipboardList,
    },
    {
      label: 'Facturas',
      href: '/invoices',
      icon: FaFileInvoice,
    },
    {
      label: 'Crear Orden de Compra',
      href: '/purchase-orders/create',
      icon: PiStackPlusFill,
    },
    {
      label: 'Editar Orden de Compra',
      href: '/purchase-orders/edit',
      icon: null,
    },
    {
      label: 'Catalogos',
      href: '/catalogs',
      icon: BiCategory,
    },
    {
      label: 'Crear Modelo de Inventarios',
      href: '/catalogs/inventory-models/create',
      icon: null,
    },
    {
      label: 'Editar Modelo de Inventarios',
      href: '/catalogs/inventory-models/edit',
      icon: null,
    },
    {
      label: 'Usuarios',
      href: '/users',
      icon: FaUserCircle,
    },
    {
      label: 'Crear Usuario',
      href: '/users/create',
      icon: null,
    },
    {
      label: 'Editar Usuario',
      href: '/users/edit',
      icon: null,
    },
    {
      label: 'Detalles del Usuario',
      href: '/users/view',
      icon: null,
    },
    {
      label: 'Configuracion de la Cuenta',
      href: '/account-settings',
      icon: FaUserCog,
    },
    {
      label: 'Control de roles',
      href: '/roles',
      icon: FaUserShield,
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
