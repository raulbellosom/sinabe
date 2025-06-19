import {
  FaClipboardList,
  FaSitemap,
  FaUserCircle,
  FaUserCog,
  FaUserShield,
} from 'react-icons/fa';
import { HiHome } from 'react-icons/hi';
import { MdChecklist } from 'react-icons/md';
import { PiStackPlusFill } from 'react-icons/pi';
import { BiCategory } from 'react-icons/bi';
import { AiOutlineProject } from 'react-icons/ai';

const BreadcrumbsBuilder = (path) => {
  // No mostrar breadcrumbs en home o dashboard
  if (path === '/' || path === '/dashboard') {
    return [];
  }

  const breadcrumbs = [
    // {
    //   label: 'Home',
    //   href: '/',
    //   icon: HiHome,
    // },
    {
      label: 'Inventarios',
      href: '/inventories',
      icon: FaClipboardList,
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

  const newPathArray = pathArray.map((item, index) => {
    return pathArray.slice(0, index + 1).join('/');
  });

  let breadcrumb = [];

  newPathArray.forEach((item) => {
    const found = breadcrumbs.find(
      (breadcrumb) => breadcrumb.href === `/${item}`,
    );
    if (found) {
      breadcrumb.push(found);
    }
  });

  return breadcrumb;
};

export default BreadcrumbsBuilder;
