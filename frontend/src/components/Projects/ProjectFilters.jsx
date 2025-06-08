import { Dropdown } from 'flowbite-react';
import { TbFilter } from 'react-icons/tb';
import { useMemo } from 'react';
import classNames from 'classnames';

const ProjectFilters = ({ verticals, filters, setFilters }) => {
  const statusOptions = useMemo(
    () => ['Planificación', 'En progreso', 'Finalizado'],
    [],
  );

  // Handlers para estados
  const toggleStatus = (status) => {
    setFilters((prev) => {
      const current = prev.statuses || [];
      return {
        ...prev,
        statuses: current.includes(status)
          ? current.filter((s) => s !== status)
          : [...current, status],
      };
    });
  };

  const toggleSelectAllStatuses = () => {
    setFilters((prev) => ({
      ...prev,
      statuses:
        prev.statuses.length === statusOptions.length ? [] : statusOptions,
    }));
  };

  // Handlers para verticales
  const toggleVertical = (id) => {
    setFilters((prev) => {
      const isSelected = prev.verticalIds.includes(id);
      return {
        ...prev,
        verticalIds: isSelected
          ? prev.verticalIds.filter((vid) => vid !== id)
          : [...prev.verticalIds, id],
      };
    });
  };

  const toggleSelectAllVerticals = () => {
    setFilters((prev) => ({
      ...prev,
      verticalIds:
        prev.verticalIds.length === verticals.length
          ? []
          : verticals.map((v) => v.id),
    }));
  };

  // Dropdown item reutilizable
  const CustomDropdownItem = ({ name, onClick, checked }) => (
    <Dropdown.Item
      as="button"
      onClick={onClick}
      className="flex justify-between items-center"
    >
      <span className="text-xs md:text-sm">{name}</span>
      <input type="checkbox" readOnly checked={checked} className="" />
    </Dropdown.Item>
  );

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium block mb-1 truncate">
        Verticales y Estados
      </label>
      <Dropdown
        renderTrigger={() => (
          <button className="flex items-center px-4 py-2 text-white bg-sinabe-primary hover:bg-sinabe-primary/90 rounded shadow transition text-sm">
            <TbFilter size={18} />
            <span className="ml-2">Filtrar</span>
          </button>
        )}
        placement="bottom-start"
        className="w-64"
        dismissOnClick={false}
      >
        <div className="px-4 py-2">
          <h2 className="text-xs md:text-sm font-semibold">
            Filtrar por Estado
          </h2>
        </div>
        <Dropdown.Divider />

        <CustomDropdownItem
          name={
            filters.statuses.length === statusOptions.length
              ? 'Quitar todos'
              : 'Seleccionar todos'
          }
          onClick={toggleSelectAllStatuses}
          checked={filters.statuses.length === statusOptions.length}
        />

        <Dropdown.Divider />

        {statusOptions.map((status) => (
          <CustomDropdownItem
            key={status}
            name={status}
            onClick={() => toggleStatus(status)}
            checked={filters.statuses.includes(status)}
          />
        ))}

        <Dropdown.Divider />

        <div className="px-4 py-2">
          <h2 className="text-xs md:text-sm font-semibold">
            Filtrar por Vertical
          </h2>
        </div>
        <Dropdown.Divider />

        <CustomDropdownItem
          name={
            filters.verticalIds.length === verticals.length
              ? 'Quitar todas'
              : 'Seleccionar todas'
          }
          onClick={toggleSelectAllVerticals}
          checked={filters.verticalIds.length === verticals.length}
        />

        <Dropdown.Divider />

        {verticals.map((v) => (
          <CustomDropdownItem
            key={v.id}
            name={v.name}
            onClick={() => toggleVertical(v.id)}
            checked={filters.verticalIds.includes(v.id)}
          />
        ))}
      </Dropdown>
    </div>
  );
};

export default ProjectFilters;
