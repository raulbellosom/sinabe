import { useEffect, useState } from 'react';
import withPermission from '../../utils/withPermissions';
import { getDashboardData } from '../../services/api';
import InventoryStatusCards from './graphics/InventoryStatusCards';
import PieChart from './graphics/PieChart';
import {
  Package,
  Pencil,
  Eye,
  Factory,
  Sun,
  Wrench,
  ClipboardList,
  Calendar,
  Moon,
  Sunrise,
  LayoutGrid,
  MoreVertical,
  Users,
} from 'lucide-react';
import DonutChart from './graphics/DonutChart';
import PolarAreaChart from './graphics/PolarAreaChart';
import AreaChart from './graphics/AreaChart';
import TableChart from './graphics/TableChart';
import GradientChart from './graphics/GradientChart';
import { Link } from 'react-router-dom';
import { ThreeCircles } from 'react-loader-spinner';
import Skeleton from 'react-loading-skeleton';

const getCurrentUser = () => {
  // Si tienes contexto de usuario, reemplaza esto por el hook/contexto real
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Usuario' };
  return user.firstName + ' ' + user.lastName || 'Usuario';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return {
      text: '¡Buenos días',
      icon: <Sunrise size={40} className="inline text-yellow-400 mb-1" />,
    };
  }
  if (hour >= 12 && hour < 19) {
    return {
      text: '¡Buenas tardes',
      icon: <Sun size={40} className="inline text-orange-400 mb-1" />,
    };
  }
  return {
    text: '¡Buenas noches',
    icon: <Moon size={40} className="inline text-blue-500 mb-1" />,
  };
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    getDashboardData().then(setDashboard).catch(console.error);
  }, []);

  const userName = getCurrentUser();
  const greeting = getGreeting();

  return (
    <div className="h-full">
      {dashboard && (
        <div className="mb-4 p-4 bg-white dark:bg-neutral-800 shadow dark:shadow-neutral-900/50 rounded-lg flex flex-col-reverse md:flex-row items-center justify-between">
          <div className="flex items-center gap-1 w-full">
            <span>
              <LayoutGrid
                size={32}
                className="inline text-sinabe-primary mr-2"
              />
            </span>
            <div>
              <h1 className="text-base md:text-xl font-bold dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Aquí puedes ver un resumen de los inventarios y su estado
                actual.
              </p>
            </div>
          </div>
          <div className="flex w-full md:justify-end items-center gap-2 text-md md:text-lg text-gray-700 dark:text-gray-300">
            <span className="text-2xl">{greeting.icon}</span>
            <span>
              {greeting.text},{' '}
              <span className="font-semibold text-base md:text-xl text-sinabe-primary">
                {userName}
              </span>
              !
            </span>
          </div>
        </div>
      )}

      {dashboard && (
        <InventoryStatusCards
          total={dashboard.cards.total}
          byStatus={dashboard.cards.byStatus}
        />
      )}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 3xl:grid-cols-4 gap-4 my-4">
          <DonutChart
            title="Inventarios por Status"
            subtitle="Estatus de los inventarios"
            icon={<ClipboardList />}
            dataObj={dashboard.distribution.byStatus}
            colors={{
              ALTA: '#4bc0c0',
              PROPUESTA: '#fbbf24',
              BAJA: '#f87171',
            }}
          />
          <PolarAreaChart
            title="Inventarios por Condición"
            subtitle="Estado actual de los equipos registrados"
            icon={<Wrench />}
            dataObj={dashboard.distribution.byCondition}
          />
          <PieChart
            title="Distribución por Tipo"
            subtitle="Categorización de inventarios por tipo de equipo"
            icon={<Package />}
            dataObj={dashboard.distribution.byType}
          />
          <PieChart
            title="Distribución por Marca"
            subtitle="Inventarios clasificados por fabricante"
            icon={<Factory />}
            dataObj={dashboard.distribution.byBrand}
          />
        </div>
      )}
      {dashboard && (
        <div className="my-4">
          <AreaChart
            title="Inventarios Creados por Mes"
            subtitle="Tendencia de registro de nuevos inventarios durante el año"
            icon={<Calendar />}
            labels={dashboard.months}
            dataValues={dashboard.inventoriesByMonth.map((m) => m.count)}
          />
        </div>
      )}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 3xl:grid-cols-4 gap-4 my-4">
          <TableChart
            title="Últimos Movimientos"
            subtitle="Los 5 inventarios más recientes en el sistema"
            icon={<Package />}
            columns={[
              { key: 'model', label: 'Modelo' },
              {
                key: 'type',
                label: 'Tipo',
              },
              {
                key: 'brand',
                label: 'Marca',
              },
              { key: 'serial', label: 'Serie' },
              { key: 'status', label: 'Estado' },
              { key: 'date', label: 'Fecha' },
              { key: 'actions', label: 'Acciones' },
            ]}
            rows={dashboard.latestInventories.map((inv) => ({
              model: inv.model?.name || '',
              type: inv.model?.type?.name || '',
              brand: inv.model?.brand?.name || '',
              serial: inv.serialNumber,
              status: inv.status,
              date: inv.createdAt?.slice(0, 10), // yyyy-mm-dd
              actions: (
                <div className="flex items-center gap-1">
                  <Link
                    to={`/inventories/view/${inv.id}`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-600 text-gray-500 dark:text-gray-400 hover:text-sinabe-primary dark:hover:text-sinabe-primary transition-colors"
                    title="Ver Detalles"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    to={`/inventories/edit/${inv.id}`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-600 text-gray-500 dark:text-gray-400 hover:text-sinabe-primary dark:hover:text-sinabe-primary transition-colors"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </Link>
                </div>
              ),
            }))}
          />
          <GradientChart
            title="Inventarios por Usuario por Mes"
            subtitle="Tendencia de registro de inventarios por usuario durante el año"
            icon={<Users />}
            labels={dashboard.months}
            usersData={dashboard.inventoriesByUserMonthly}
          />
        </div>
      )}

      {!dashboard && (
        <div className="flex flex-col items-start justify-start h-[80dvh]">
          <div className="mb-4 p-4 w-full">
            <Skeleton
              height={138}
              className="w-full"
              baseColor="var(--skeleton-base)"
              highlightColor="var(--skeleton-highlight)"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 w-full">
            <Skeleton
              height={150}
              className="w-full"
              baseColor="var(--skeleton-base)"
              highlightColor="var(--skeleton-highlight)"
            />
            <Skeleton
              height={150}
              className="w-full"
              baseColor="var(--skeleton-base)"
              highlightColor="var(--skeleton-highlight)"
            />
            <Skeleton
              height={150}
              className="w-full"
              baseColor="var(--skeleton-base)"
              highlightColor="var(--skeleton-highlight)"
            />
            <Skeleton
              height={150}
              className="w-full"
              baseColor="var(--skeleton-base)"
              highlightColor="var(--skeleton-highlight)"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 3xl:grid-cols-4 gap-4 my-4 w-full">
            <Skeleton
              height={250}
              className="w-full"
              baseColor="var(--skeleton-base)"
              highlightColor="var(--skeleton-highlight)"
            />
            <Skeleton
              height={250}
              className="w-full"
              baseColor="var(--skeleton-base)"
              highlightColor="var(--skeleton-highlight)"
            />
            <Skeleton
              height={250}
              className="w-full"
              baseColor="var(--skeleton-base)"
              highlightColor="var(--skeleton-highlight)"
            />
            <Skeleton
              height={250}
              className="w-full"
              baseColor="var(--skeleton-base)"
              highlightColor="var(--skeleton-highlight)"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ProtectedInventoriesView = withPermission(Dashboard, 'view_dashboard');
export default ProtectedInventoriesView;
