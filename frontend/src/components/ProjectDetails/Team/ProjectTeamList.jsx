import React, { useMemo, useState } from 'react';
import {
  useProjectTeam,
  useRemoveUserFromProject,
} from '../../../hooks/useProjectTeam';
import ModalProjectMember from './ModalProjectMember';
import {
  FaPlus,
  FaUserMinus,
  FaUserCircle,
  FaUsers,
  FaUserTie,
  FaEdit,
} from 'react-icons/fa';
import ConfirmRemoveProjectMemberModal from './ConfirmRemoveProjectMemberModal';
import FilterDropdown from '../../Inputs/FilterDropdown';
import { FormattedUrlImage } from '../../../utils/FormattedUrlImage';
import Notifies from '../../Notifies/Notifies';

const ProjectTeamList = ({ projectId }) => {
  const { data: team = [], isLoading } = useProjectTeam(projectId);
  const removeMember = useRemoveUserFromProject(projectId);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilters, setRoleFilters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);

  const handleRemove = async (memberId) => {
    try {
      await removeMember.mutateAsync(memberId);
      Notifies('success', `Miembro eliminado`);

      setSelectedMember(null);
    } catch (err) {
      console.error('Error al eliminar miembro:', err);
    }
  };

  const allRoles = useMemo(() => {
    const roleMap = {};
    team.forEach((m) => {
      const key = m.role.trim().toLowerCase();
      roleMap[key] = m.role;
    });
    return Object.entries(roleMap).map(([key, label]) => ({
      id: key,
      name: label,
    }));
  }, [team]);

  const filteredTeam = useMemo(() => {
    return team.filter((member) => {
      const nameMatch = member.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const roleMatch = member.role
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const roleFilterMatch =
        roleFilters.length === 0 ||
        roleFilters.includes(member.role.trim().toLowerCase());
      return (nameMatch || roleMatch) && roleFilterMatch;
    });
  }, [team, searchTerm, roleFilters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sinabe-primary text-2xl">
            <FaUsers className="text-sinabe-primary text-xl" />
          </span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Miembros del equipo
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o rol"
            className="px-4 py-2 w-full md:w-72 text-sm rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
          />

          <div className="flex gap-2 items-center justify-between md:justify-start">
            <div>
              <FilterDropdown
                label="Roles"
                options={allRoles}
                selected={roleFilters}
                setSelected={setRoleFilters}
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-sinabe-primary hover:bg-sinabe-primary/80 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm"
            >
              <FaPlus /> <span className="">Agregar miembro</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-300">Cargando equipo...</p>
      ) : filteredTeam.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          <FaUserCircle className="text-5xl mx-auto text-sinabe-primary mb-2" />
          <p className="font-medium text-lg">No hay miembros que coincidan</p>
          <p className="text-sm">Ajusta la búsqueda o limpia los filtros.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredTeam.map((member) => (
            <li
              key={member.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-5 flex gap-4 items-center"
            >
              {member.thumbnail ? (
                <img
                  src={FormattedUrlImage(member.thumbnail)}
                  alt={member.name}
                  className="w-14 h-14 rounded-full object-cover border border-sinabe-primary"
                />
              ) : (
                <div className="w-14 h-14 bg-sinabe-primary text-white rounded-full flex items-center justify-center font-semibold text-xl">
                  {member.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {member.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <FaUserTie className="text-sinabe-primary" /> {member.role}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setEditingMember(member)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar miembro"
                >
                  <FaEdit />
                </button>

                <button
                  onClick={() => setSelectedMember(member)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar miembro"
                >
                  <FaUserMinus className="text-xl" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ModalProjectMember
        isOpen={isModalOpen || !!editingMember}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(null);
        }}
        projectId={projectId}
        memberToEdit={editingMember}
      />

      <ConfirmRemoveProjectMemberModal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onConfirm={handleRemove}
      />
    </div>
  );
};

export default ProjectTeamList;
