import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

import Logo from '../../assets/logo/sinabe_icon.png';
import InventorySearchCombobox from '../InventoryComponents/InventorySearchCombobox';
import { AIAgentButton } from '../AIAgent';
import NotificationBell from '../Notifications/NotificationBell';
import UserMenuDropdown from './UserMenuDropdown';

// Navbar sin botón de colapsar — el sidebar maneja su propio toggle
const Navbar = () => {
  return (
    <header className="absolute left-0 top-0 z-50 flex h-[calc(4rem+env(safe-area-inset-top))] w-full items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)] px-2 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] shadow-sm">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0 md:hidden">
          <InventorySearchCombobox />
          <Link
            to="/inventories/create"
            className="flex items-center justify-center rounded-lg p-2 text-[color:var(--foreground-muted)] transition-all hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--primary)]"
            aria-label="Nuevo inventario"
          >
            <PlusCircle className="h-6 w-6" />
          </Link>
        </div>
      </div>

      <div className="hidden flex-1 items-center gap-2 md:flex">
        <InventorySearchCombobox />
        <Link
          to="/inventories/create"
          className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] px-4 py-2.5 text-[color:var(--foreground-muted)] transition-all hover:border-[color:var(--primary)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--primary)]"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Nuevo</span>
        </Link>
      </div>

      <div className="hidden items-center gap-1 md:flex">
        <AIAgentButton />
        <NotificationBell />
        <div className="ml-2 border-l border-[color:var(--border)] pl-3">
          <UserMenuDropdown />
        </div>
      </div>

      <div className="flex items-center gap-2 md:hidden">
        <AIAgentButton />
        <NotificationBell />
        <UserMenuDropdown />
        <img src={Logo} alt="Sinabe" className="h-8 w-auto" />
      </div>
    </header>
  );
};

export default Navbar;
