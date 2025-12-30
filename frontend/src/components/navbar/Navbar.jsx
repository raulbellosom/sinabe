import React from 'react';
import { Button } from 'flowbite-react';
import { HiOutlineMenuAlt1 } from 'react-icons/hi';
import Logo from '../../assets/logo/sinabe_icon.png';
import InventorySearchCombobox from '../InventoryComponents/InventorySearchCombobox';
import { Link } from 'react-router-dom';
import { AiFillPlusCircle } from 'react-icons/ai';
import { AIAgentButton } from '../AIAgent';
import NotificationBell from '../Notifications/NotificationBell';
import UserMenuDropdown from './UserMenuDropdown';

const Navbar = ({
  collapsed,
  setCollapsed = () => {},
  toggled,
  setToggled = () => {},
  broken,
}) => {
  return (
    <div className="flex justify-between items-center bg-white shadow-md px-2 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] w-full h-[calc(4rem+env(safe-area-inset-top))] absolute top-0 left-0 z-50">
      {/* Lado izquierdo: Menú hamburguesa + Búsqueda + Nuevo inventario (móvil) */}
      <div className="flex items-center gap-1">
        <Button
          onClick={broken ? setToggled : setCollapsed}
          color="light"
          style={{ borderStyle: 'none' }}
          className="h-8 w-8 flex items-center justify-center rounded-md transition-colors duration-100 ease-in-out text-sinabe-primary hover:text-purple-600"
        >
          <HiOutlineMenuAlt1 className="text-2xl cursor-pointer" />
        </Button>

        {/* En móvil: Búsqueda y Nuevo inventario a la izquierda */}
        <div className="flex items-center gap-0 md:hidden">
          <InventorySearchCombobox />
          <Link
            to="/inventories/create"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
          >
            <AiFillPlusCircle className="w-6 h-6" />
            <span className="text-sm font-medium">Nuevo</span>
          </Link>
        </div>
      </div>

      {/* Desktop: Búsqueda y Nuevo a la izquierda */}
      <div className="hidden md:flex items-center gap-2 flex-1">
        <InventorySearchCombobox />
        <Link
          to="/inventories/create"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 border border-gray-200 hover:border-purple-300"
        >
          <AiFillPlusCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Nuevo</span>
        </Link>
      </div>

      {/* Desktop: IA, Notificaciones y Usuario a la derecha */}
      <div className="hidden md:flex items-center gap-1">
        <AIAgentButton />
        <NotificationBell />
        {/* Menú de usuario en desktop */}
        <div className="ml-2 pl-3 border-l border-gray-200">
          <UserMenuDropdown />
        </div>
      </div>

      {/* Lado derecho en móvil: IA, Notificaciones, Perfil, Logo */}
      <div className="flex md:hidden items-center gap-2">
        <AIAgentButton />
        <NotificationBell />
        <UserMenuDropdown />
        <img src={Logo} alt="Sinabe" className="h-8 w-auto" />
      </div>
    </div>
  );
};

export default Navbar;
