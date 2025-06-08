import { FaEye, FaPen, FaTrash, FaSearch } from 'react-icons/fa';
import ProjectStatusBadge from './ProjectStatusBadge';
import ProjectProgressBar from './ProjectProgressBar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Dropdown } from 'flowbite-react';
import ActionButtons from '../ActionButtons/ActionButtons';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { parseToLocalDate } from '../../utils/formatValues';

const ProjectTable = ({ projects, isLoading, searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  const collapsedActions = (inventory) => [
    {
      label: 'Editar',
      action: () => navigate(`/projects/edit/${inventory.id}/`),
      icon: FaPen,
      disabled: false,
    },
    {
      label: 'Eliminar',
      action: () => console.log('Eliminar', inventory.id),
      icon: FaTrash,
      color: 'red',
      disabled: false,
    },
  ];

  return (
    <div className="mb-6">
      {/* Search bar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Buscar proyecto..."
              className="w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sinabe-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-[900px] w-full text-sm text-left text-gray-700">
          <thead className="bg-sinabe-gray text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Proyecto</th>
              <th className="px-4 py-3">Vertical</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Progreso</th>
              <th className="px-4 py-3">Presupuesto</th>
              <th className="px-4 py-3">Fechas</th>
              <th className="px-4 py-3">OC / Facturas</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-t">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton height={20} />
                      </td>
                    ))}
                  </tr>
                ))
              : projects.map((p) => {
                  const invoices =
                    p.purchaseOrders?.flatMap((oc) => oc.invoices) || [];
                  const used = invoices.reduce(
                    (acc, f) => acc + (f.amount || 0),
                    0,
                  );
                  const percentage = Math.round((used / p.budgetTotal) * 100);

                  return (
                    <tr
                      key={p.id}
                      className="border-t hover:bg-gray-50 animate-fade-in-up"
                      // style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <td className="px-4 py-3 font-mono text-sm text-nowrap">
                        {p.code}
                      </td>
                      <td className="px-4 py-3 min-w-48">{p.name}</td>
                      <td className="px-4 py-3 inline-flex gap-2 flex-wrap">
                        {p.verticals?.map((v, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded-full bg-sinabe-blue-dark text-white text-nowrap"
                          >
                            {v.name}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-3">{p.provider}</td>
                      <td className="px-4 py-3">
                        <ProjectStatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        <ProjectProgressBar value={percentage} />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-sm">
                            ${p.budgetTotal.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Usado: ${used.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs leading-tight">
                          {parseToLocalDate(p.startDate)} →{' '}
                          {parseToLocalDate(p.endDate)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium">
                          {p.purchaseOrders?.length || 0} OC
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2 items-center text-sinabe-primary">
                        <ActionButtons
                          extraActions={[
                            {
                              label: 'Ver',
                              href: `/projects/${p.id}`,
                              icon: FaEye,
                            },
                          ]}
                          className="w-full"
                          buttonClassName="w-full bg-white hover:bg-neutral-200 md:w-fit h-9 xl:h-10 text-sm xl:text-base cursor-pointer transition ease-in-out duration-200 p-4 flex items-center justify-center rounded-md border text-stone-800"
                          iconClassName="text-lg text-neutral-600"
                        />
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
                          {collapsedActions(p).map((action, index) => (
                            <Dropdown.Item
                              key={index}
                              className="min-w-36 min-h-12"
                              onClick={() => action?.action()}
                              icon={action?.icon}
                            >
                              <span>{action?.label}</span>
                            </Dropdown.Item>
                          ))}
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectTable;
