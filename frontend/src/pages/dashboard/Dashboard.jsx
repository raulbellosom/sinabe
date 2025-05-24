import { useEffect, useState } from 'react';
import withPermission from '../../utils/withPermissions';
import { getDashboardData } from '../../services/api';
import InventoryStatusCards from './graphics/InventoryStatusCards';
import PieChart from './graphics/PieChart';
import {
  FaBoxOpen,
  FaEdit,
  FaEye,
  FaIndustry,
  FaSun,
  FaTools,
} from 'react-icons/fa';
import {
  MdAssignment,
  MdCalendarMonth,
  MdNightsStay,
  MdWbSunny,
} from 'react-icons/md';
import DonutChart from './graphics/DonutChart';
import PolarAreaChart from './graphics/PolarAreaChart';
import AreaChart from './graphics/AreaChart';
import TableChart from './graphics/TableChart';
import GradientChart from './graphics/GradientChart';
import { Dropdown } from 'flowbite-react';
import { BsGrid1X2Fill, BsThreeDotsVertical } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { WiSunrise } from 'react-icons/wi';
import { ThreeCircles } from 'react-loader-spinner';

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
      icon: <WiSunrise size={40} className="inline text-yellow-400 mb-1" />,
    };
  }
  if (hour >= 12 && hour < 19) {
    return {
      text: '¡Buenas tardes',
      icon: <FaSun size={40} className="inline text-orange-400 mb-1" />,
    };
  }
  return {
    text: '¡Buenas noches',
    icon: <MdNightsStay size={40} className="inline text-blue-500 mb-1" />,
  };
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    getDashboardData().then(setDashboard).catch(console.error);
  }, []);

  const userName = getCurrentUser();
  const greeting = getGreeting();

  const collapsedActions = (inventory) => [
    {
      label: 'Ver Detalles',
      href: `/inventories/view/${inventory.id}`,
      icon: FaEye,
      disabled: true,
    },
    {
      label: 'Editar',
      href: `/inventories/edit/${inventory.id}`,
      icon: FaEdit,
      disabled: true,
    },
  ];

  return (
    <div className="h-full">
      <div className="mb-4 p-4 bg-white shadow rounded-lg flex flex-col-reverse md:flex-row items-center justify-between">
        <div className="flex items-center gap-1 w-full">
          <span>
            <BsGrid1X2Fill
              size={32}
              className="inline text-sinabe-primary-500 mr-2 text-sinabe-primary"
            />
          </span>
          <div>
            <h1 className="text-base md:text-xl font-bold">Dashboard</h1>
            <p className="text-gray-600 text-sm">
              Aquí puedes ver un resumen de los inventarios y su estado actual.
            </p>
          </div>
        </div>
        <div className="flex w-full md:justify-end items-center gap-2 text-md md:text-lg text-gray-700">
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
            icon={<MdAssignment />}
            dataObj={dashboard.distribution.byStatus}
            colors={{
              ALTA: 'rgba(75, 192, 192, 0.6)',
              PROPUESTA: 'rgba(255, 206, 86, 0.6)',
              BAJA: 'rgba(255, 99, 132, 0.6)',
            }}
          />
          <PolarAreaChart
            title="Inventarios por Condición"
            subtitle="Estado actual de los equipos registrados"
            icon={<FaTools />}
            dataObj={dashboard.distribution.byCondition}
          />
          <PieChart
            title="Distribución por Tipo"
            subtitle="Categorización de inventarios por tipo de equipo"
            icon={<FaBoxOpen />}
            dataObj={dashboard.distribution.byType}
          />
          <PieChart
            title="Distribución por Marca"
            subtitle="Inventarios clasificados por fabricante"
            icon={<FaIndustry />}
            dataObj={dashboard.distribution.byBrand}
          />
        </div>
      )}
      {dashboard && (
        <div className="my-4">
          <AreaChart
            title="Inventarios Creados por Mes"
            subtitle="Tendencia de registro de nuevos inventarios durante el año"
            icon={<MdCalendarMonth />}
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
            icon={<FaBoxOpen />}
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
                <Dropdown
                  renderTrigger={() => (
                    <button className="w-fit bg-white hover:bg-neutral-200 md:w-fit h-9 xl:h-10 text-sm xl:text-base cursor-pointer transition ease-in-out duration-200 p-4 flex items-center justify-center rounded-md border text-stone-800">
                      <BsThreeDotsVertical className="text-lg text-neutral-600" />
                    </button>
                  )}
                  dismissOnClick={true}
                  inline
                  arrowIcon={null}
                  placement="right"
                  className="md:w-52"
                >
                  {collapsedActions(inv).map(
                    (action, index) =>
                      action.disabled && (
                        <Dropdown.Item
                          key={index}
                          className="min-w-36 min-h-12"
                          icon={action?.icon}
                        >
                          <Link to={action?.href}>{action?.label}</Link>
                        </Dropdown.Item>
                      ),
                  )}
                </Dropdown>
              ),
            }))}
          />
          <GradientChart
            title="Inventarios por Usuario por Mes"
            subtitle="Tendencia de registro de inventarios por usuario durante el año"
            icon={<MdAssignment />}
            labels={dashboard.months}
            usersData={dashboard.inventoriesByUserMonthly}
          />
        </div>
      )}

      {!dashboard && (
        <div className="flex items-center justify-center h-96">
          <ThreeCircles
            visible={true}
            height="150"
            width="150"
            color="#7e3af2"
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperclassName=""
          />
        </div>
      )}
    </div>
  );
};

const ProtectedInventoriesView = withPermission(Dashboard, 'view_dashboard');
export default ProtectedInventoriesView;
