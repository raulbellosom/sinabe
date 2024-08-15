import { useState } from 'react';
import ActionButtons from '../ActionButtons/ActionButtons';
import { useAuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import LinkButton from '../ActionButtons/LinkButton';

const TableHeader = ({ title, labelButton, redirect }) => {
  const { user } = useAuthContext();
  const [isOpenModal, setIsOpenModal] = useState(false);

  return (
    <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between">
      <h1 className="text-xl font-bold text-orange-500 w-full">{title}</h1>
      <div className="w-full flex justify-center md:justify-end items-center gap-2 rounded-md p-2 md:border-none md:p-0">
        <LinkButton
          icon={FaPlus}
          color="green"
          route="/vehicles/create"
          label="Crear vehículo"
        />
      </div>
    </div>
  );
};

export default TableHeader;
