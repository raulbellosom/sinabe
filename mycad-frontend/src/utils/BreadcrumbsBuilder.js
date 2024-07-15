import { FaCar } from 'react-icons/fa';
import { HiHome } from 'react-icons/hi';
import { MdChecklist } from 'react-icons/md';
import { PiStackPlusFill } from 'react-icons/pi';
import { LuPenSquare } from 'react-icons/lu';

const BreadcrumbsBuilder = (path) => {
  const breadcrumbs = [
    {
      label: 'Home',
      href: '/',
      icon: HiHome,
    },
    {
      label: 'Vehiculos',
      href: '/vehicles',
      icon: FaCar,
    },
    {
      label: 'Crear Vehiculo',
      href: '/vehicles/create',
      icon: PiStackPlusFill,
    },
    {
      label: 'Editar Vehiculo',
      href: '/vehicles/edit',
      icon: LuPenSquare,
    },
    {
      label: 'Detalles del Vehiculo',
      href: '/vehicles/view',
      icon: MdChecklist,
    },
    {
      label: 'Crear Tipo de Vehiculo',
      href: '/vehicle-types/create',
      icon: null,
    },
    {
      label: 'Editar Tipo de Vehiculo',
      href: '/vehicle-types/edit',
      icon: null,
    },
    {
      label: 'Detalles del Tipo de Vehiculo',
      href: '/vehicle-types/view',
      icon: null,
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
