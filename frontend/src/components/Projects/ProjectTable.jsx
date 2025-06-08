import { FaEye, FaPen, FaTrash } from 'react-icons/fa';
import ProjectStatusBadge from './ProjectStatusBadge';
import ProjectProgressBar from './ProjectProgressBar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Dropdown } from 'flowbite-react';
import ActionButtons from '../ActionButtons/ActionButtons';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { parseToLocalDate } from '../../utils/formatValues';

const ProjectTable = ({
  projects,
  isLoading,
  sortBy,
  order,
  onSortChange,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) => {
  const navigate = useNavigate();

  const collapsedActions = (project) => [
    {
      label: 'Editar',
      action: () => navigate(`/projects/edit/${project.id}/`),
      icon: FaPen,
    },
    {
      label: 'Eliminar',
      action: () => console.log('Eliminar', project.id),
      icon: FaTrash,
      color: 'red',
    },
  ];

  const renderSortHeader = (label, field) => (
    <th
      className="px-4 py-3 cursor-pointer select-none"
      onClick={() => onSortChange(field)}
    >
      {label} {sortBy === field && (order === 'asc' ? '▲' : '▼')}
    </th>
  );

  return (
    <div className="mb-6">
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-[900px] w-full text-sm text-left text-gray-700">
          <thead className="bg-sinabe-gray text-gray-600 uppercase text-xs">
            <tr>
              {renderSortHeader('ID', 'code')}
              {renderSortHeader('Proyecto', 'name')}
              {renderSortHeader('Vertical', 'verticals')}
              {renderSortHeader('Proveedor', 'provider')}
              {renderSortHeader('Estado', 'status')}
              <th className="px-4 py-3">Progreso</th>
              {renderSortHeader('Presupuesto', 'budgetTotal')}
              {renderSortHeader('Fechas', 'startDate')}
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
                      className="border-t hover:bg-gray-50 transition-opacity duration-500 animate-fade-in-up"
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
                      <td className="px-4 py-3 min-w-40">
                        <div className="text-xs leading-tight">
                          <strong>{parseToLocalDate(p.startDate)} → </strong>
                          <span>{parseToLocalDate(p.endDate)}</span>
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
                              href: `/projects/view/${p.id}`,
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

      {/* Paginación */}
      <div className="flex flex-col-reverse gap-3 md:flex-row justify-between items-center mt-6">
        <span>
          Página {page} de {Math.ceil(total / pageSize)}
        </span>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-100 text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page * pageSize >= total}
              className="px-3 py-1 rounded bg-gray-100 text-sm disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <select
            className="text-sm px-2 py-1 border rounded"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProjectTable;
