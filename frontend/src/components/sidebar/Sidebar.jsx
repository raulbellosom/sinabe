import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderArchive,
  LayoutDashboard,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sun,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';

import { useAuthContext } from '../../context/AuthContext';
import { useUserPreference } from '../../context/UserPreferenceContext';
import { useTheme } from '../../providers/theme/useTheme';
import useCheckPermissions from '../../hooks/useCheckPermissions';
import { API_URL } from '../../config/env';
import Navbar from '../navbar/Navbar';
import MainLayout from '../../Layout/MainLayout';
import InventorySearchCombobox from '../InventoryComponents/InventorySearchCombobox';
import Button from '../ui/Button';

import BgPattern1 from '../../assets/bg/bg_sidebar_1.png';
import BgPattern2 from '../../assets/bg/bg_sidebar_2.png';
import BgPattern3 from '../../assets/bg/bg_sidebar_3.png';
import BgPattern4 from '../../assets/bg/bg_sidebar_4.png';
import SinabeIcon from '../../assets/logo/sinabe_icon_white.png';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)';
const COLLAPSED_WIDTH = '4.8rem';
const EXPANDED_WIDTH = '18.5rem';

const getSidebarBackgroundImage = (preferences) => {
  if (preferences?.sidebarBgUrl) {
    const relativePath = preferences.sidebarBgUrl.replace(/^uploads\//, '');
    return `${API_URL}/uploads/${relativePath}`;
  }

  switch (preferences?.sidebarBgId) {
    case 2:
      return BgPattern2;
    case 3:
      return BgPattern3;
    case 4:
      return BgPattern4;
    case 1:
    default:
      return BgPattern1;
  }
};

const SidebarItemLabel = ({ collapsed, children }) => (
  <span
    className={`whitespace-nowrap overflow-hidden text-left transition-all duration-300 ease-out ${
      collapsed
        ? 'max-w-0 opacity-0 translate-x-1 pointer-events-none'
        : 'max-w-[180px] opacity-100 translate-x-0'
    }`}
  >
    {children}
  </span>
);

const SidebarLinkItem = ({
  to,
  icon: Icon,
  label,
  collapsed,
  active,
  onClick,
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
        : 'text-white/90 hover:bg-purple-500/20 hover:text-white'
    }`}
  >
    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
      <Icon size={20} strokeWidth={2.1} />
    </span>
    <SidebarItemLabel collapsed={collapsed}>{label}</SidebarItemLabel>
  </Link>
);

const SidebarSubmenu = ({
  icon: Icon,
  label,
  collapsed,
  open,
  onToggle,
  children,
  active,
}) => (
  <div className="space-y-1">
    <button
      type="button"
      onClick={onToggle}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-purple-500/20 text-white'
          : 'text-white/90 hover:bg-purple-500/20 hover:text-white'
      }`}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        <Icon size={20} strokeWidth={2.1} />
      </span>
      <SidebarItemLabel collapsed={collapsed}>{label}</SidebarItemLabel>
      <span
        className={`ml-auto transition-all duration-300 ${
          collapsed ? 'w-0 opacity-0' : 'w-4 opacity-100'
        }`}
      >
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </span>
    </button>

    <div
      className={`overflow-hidden pl-10 transition-[max-height,opacity] duration-300 ease-out ${
        !collapsed && open ? 'max-h-[320px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="space-y-1 pb-1">{children}</div>
    </div>
  </div>
);

const Sidebar = ({ children }) => {
  const location = useLocation();
  const { user } = useAuthContext();
  const { preferences } = useUserPreference();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(DESKTOP_BREAKPOINT).matches
      : true,
  );
  const [isInventoryMenuOpen, setIsInventoryMenuOpen] = useState(true);
  const [isFinanceMenuOpen, setIsFinanceMenuOpen] = useState(false);
  const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);

  const sidebarBg = useMemo(
    () => getSidebarBackgroundImage(preferences),
    [preferences],
  );

  const isActiveRoute = (path, options = {}) => {
    const { exact = false } = options;
    const current = location.pathname;

    if (path === '/dashboard') {
      return current === '/' || current === '/dashboard';
    }

    // Exact match only
    if (exact) {
      return current === path;
    }

    // Default: exact match OR starts with path/
    return current === path || current.startsWith(`${path}/`);
  };

  const isDashboardPermission = useCheckPermissions('view_dashboard');
  const isUsersPermission = useCheckPermissions('view_users');
  const isRolesPermission = useCheckPermissions('view_roles');
  const isInventoriesPermission = useCheckPermissions('view_inventories');
  const isSelfInventoriesPermission = useCheckPermissions(
    'view_self_inventories',
  );
  const isCreateInventoryPermission = useCheckPermissions('create_inventories');
  const isModelsPermission = useCheckPermissions('view_inventories_models');
  const isBrandsPermission = useCheckPermissions('view_inventories_brands');
  const isTypesPermission = useCheckPermissions('view_inventories_types');
  const isConditionsPermission = useCheckPermissions(
    'view_inventories_conditions',
  );

  const canViewCatalogs =
    isModelsPermission.hasPermission ||
    isBrandsPermission.hasPermission ||
    isTypesPermission.hasPermission ||
    isConditionsPermission.hasPermission;

  const canViewInventoriesGroup =
    canViewCatalogs ||
    isInventoriesPermission.hasPermission ||
    isSelfInventoriesPermission.hasPermission;

  const canViewUsersGroup =
    isUsersPermission.hasPermission || isRolesPermission.hasPermission;

  const inventoryMenuIsActive =
    isActiveRoute('/inventories') ||
    isActiveRoute('/catalogs') ||
    isActiveRoute('/custody');

  const financeMenuIsActive =
    isActiveRoute('/purchase-orders') || isActiveRoute('/invoices');

  const usersMenuIsActive = isActiveRoute('/users') || isActiveRoute('/roles');

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_BREAKPOINT);

    const handleMedia = (event) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setMobileOpen(false);
      }
    };

    handleMedia(media);
    media.addEventListener('change', handleMedia);

    return () => media.removeEventListener('change', handleMedia);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setIsSearchSheetOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (inventoryMenuIsActive) setIsInventoryMenuOpen(true);
    if (financeMenuIsActive) setIsFinanceMenuOpen(true);
    if (usersMenuIsActive) setIsUsersMenuOpen(true);
  }, [inventoryMenuIsActive, financeMenuIsActive, usersMenuIsActive]);

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const sidebarBaseSurface =
    resolvedTheme === 'dark'
      ? 'rgba(7, 18, 36, 0.88)'
      : 'rgba(7, 21, 41, 0.88)';

  const handleSidebarToggle = () => {
    if (isDesktop) {
      setCollapsed((prev) => !prev);
      return;
    }
    setMobileOpen((prev) => !prev);
  };

  const handleMobileMore = () => {
    setIsSearchSheetOpen(false);
    setMobileOpen(true);
  };

  const sidebarContent = (
    <div className="relative flex h-full flex-col overflow-hidden rounded-r-2xl border-r border-purple-500/20 text-white shadow-2xl">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${sidebarBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            resolvedTheme === 'dark'
              ? 'linear-gradient(180deg, rgba(15, 10, 40, 0.55), rgba(10, 6, 30, 0.70))'
              : 'linear-gradient(180deg, rgba(30, 20, 60, 0.50), rgba(15, 10, 40, 0.65))',
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-purple-500/20 px-3 py-4">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 backdrop-blur-sm p-1.5">
              <img
                src={SinabeIcon}
                alt="Sinabe"
                className="h-full w-full object-contain"
              />
            </div>
            <SidebarItemLabel collapsed={collapsed}>
              <span className="text-lg font-bold tracking-tight">SINABE</span>
            </SidebarItemLabel>
          </Link>
        </div>

        <nav className="custom-scrollbar flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 py-3 pb-4">
          {isDashboardPermission.hasPermission ? (
            <SidebarLinkItem
              to="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              collapsed={collapsed}
              active={isActiveRoute('/dashboard')}
            />
          ) : null}

          <SidebarLinkItem
            to="/agenda"
            icon={CalendarDays}
            label="Agenda"
            collapsed={collapsed}
            active={isActiveRoute('/agenda')}
          />

          {canViewInventoriesGroup ? (
            <SidebarSubmenu
              icon={Boxes}
              label="Inventarios"
              collapsed={collapsed}
              open={isInventoryMenuOpen}
              active={inventoryMenuIsActive}
              onToggle={() => {
                if (collapsed) {
                  setCollapsed(false);
                  setIsInventoryMenuOpen(true);
                  return;
                }
                setIsInventoryMenuOpen((prev) => !prev);
              }}
            >
              {isCreateInventoryPermission.hasPermission ? (
                <SidebarLinkItem
                  to="/inventories/create"
                  icon={FolderArchive}
                  label="Nuevo Inventario"
                  collapsed={false}
                  active={isActiveRoute('/inventories/create', { exact: true })}
                />
              ) : null}

              {isInventoriesPermission.hasPermission ||
              isSelfInventoriesPermission.hasPermission ? (
                <SidebarLinkItem
                  to="/inventories"
                  icon={ClipboardList}
                  label="Inventarios"
                  collapsed={false}
                  active={isActiveRoute('/inventories', { exact: true })}
                />
              ) : null}

              {isCreateInventoryPermission.hasPermission ? (
                <SidebarLinkItem
                  to="/custody"
                  icon={ShieldCheck}
                  label="Resguardos TI"
                  collapsed={false}
                  active={isActiveRoute('/custody')}
                />
              ) : null}

              {canViewCatalogs ? (
                <SidebarLinkItem
                  to="/catalogs"
                  icon={Boxes}
                  label="Catálogos"
                  collapsed={false}
                  active={isActiveRoute('/catalogs')}
                />
              ) : null}

              {isInventoriesPermission.hasPermission ||
              isSelfInventoriesPermission.hasPermission ? (
                <SidebarLinkItem
                  to="/inventories/decommissioning"
                  icon={FolderArchive}
                  label="Bajas"
                  collapsed={false}
                  active={isActiveRoute('/inventories/decommissioning', {
                    exact: true,
                  })}
                />
              ) : null}
            </SidebarSubmenu>
          ) : null}

          <SidebarSubmenu
            icon={FileText}
            label="Finanzas"
            collapsed={collapsed}
            open={isFinanceMenuOpen}
            active={financeMenuIsActive}
            onToggle={() => {
              if (collapsed) {
                setCollapsed(false);
                setIsFinanceMenuOpen(true);
                return;
              }
              setIsFinanceMenuOpen((prev) => !prev);
            }}
          >
            <SidebarLinkItem
              to="/purchase-orders"
              icon={ClipboardList}
              label="OC"
              collapsed={false}
              active={isActiveRoute('/purchase-orders')}
            />
            <SidebarLinkItem
              to="/invoices"
              icon={FileText}
              label="Facturas"
              collapsed={false}
              active={isActiveRoute('/invoices')}
            />
          </SidebarSubmenu>

          <SidebarLinkItem
            to="/verticals"
            icon={BarChart3}
            label="Verticales"
            collapsed={collapsed}
            active={isActiveRoute('/verticals')}
          />

          {canViewUsersGroup ? (
            <SidebarSubmenu
              icon={Users}
              label="Usuarios"
              collapsed={collapsed}
              open={isUsersMenuOpen}
              active={usersMenuIsActive}
              onToggle={() => {
                if (collapsed) {
                  setCollapsed(false);
                  setIsUsersMenuOpen(true);
                  return;
                }
                setIsUsersMenuOpen((prev) => !prev);
              }}
            >
              {isUsersPermission.hasPermission ? (
                <SidebarLinkItem
                  to="/users"
                  icon={UserCircle2}
                  label="Usuarios"
                  collapsed={false}
                  active={isActiveRoute('/users')}
                />
              ) : null}

              {isRolesPermission.hasPermission ? (
                <SidebarLinkItem
                  to="/roles"
                  icon={Shield}
                  label="Roles"
                  collapsed={false}
                  active={isActiveRoute('/roles')}
                />
              ) : null}
            </SidebarSubmenu>
          ) : null}

          <SidebarLinkItem
            to="/audit-logs"
            icon={ClipboardList}
            label="Auditoría"
            collapsed={collapsed}
            active={isActiveRoute('/audit-logs')}
          />

          <SidebarLinkItem
            to="/preferences"
            icon={Settings}
            label="Preferencias"
            collapsed={collapsed}
            active={isActiveRoute('/preferences')}
          />
        </nav>

        {/* Theme toggle y colapsar */}
        <div className="mt-auto border-t border-white/15 px-2 py-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="group mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 transition-all hover:bg-white/14 hover:text-white"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              {resolvedTheme === 'dark' ? (
                <Sun size={20} strokeWidth={2.1} />
              ) : (
                <Moon size={20} strokeWidth={2.1} />
              )}
            </span>
            <SidebarItemLabel collapsed={collapsed}>
              {resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </SidebarItemLabel>
          </button>

          {/* Collapse Button - desktop only */}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            className="group hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 transition-all hover:bg-white/14 hover:text-white lg:flex"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              {collapsed ? (
                <PanelLeftOpen size={20} strokeWidth={2.1} />
              ) : (
                <PanelLeftClose size={20} strokeWidth={2.1} />
              )}
            </span>
            <SidebarItemLabel collapsed={collapsed}>
              {collapsed ? 'Expandir' : 'Colapsar'}
            </SidebarItemLabel>
          </button>
        </div>
      </div>
    </div>
  );

  const mobileBottomTabs = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: '/dashboard',
      active: isActiveRoute('/dashboard'),
      onClick: () => setIsSearchSheetOpen(false),
    },
    {
      key: 'inventories',
      label: 'Inventarios',
      icon: Boxes,
      to: '/inventories',
      active: isActiveRoute('/inventories'),
      onClick: () => setIsSearchSheetOpen(false),
    },
    {
      key: 'search',
      label: 'Buscar',
      icon: Search,
      action: () => {
        setMobileOpen(false);
        setIsSearchSheetOpen((prev) => !prev);
      },
      active: isSearchSheetOpen,
    },
    {
      key: 'custody',
      label: 'Custodias',
      icon: ShieldCheck,
      to: '/custody',
      active: isActiveRoute('/custody'),
      onClick: () => setIsSearchSheetOpen(false),
    },
    {
      key: 'more',
      label: 'Más',
      icon: Menu,
      action: handleMobileMore,
      active: mobileOpen,
    },
  ];

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-[color:var(--background)]">
      <aside
        className="relative z-40 hidden h-full shrink-0 transition-[width] duration-300 ease-out lg:block"
        style={{ width: sidebarWidth }}
      >
        {sidebarContent}
      </aside>

      {!isDesktop ? (
        <>
          <div
            className={`fixed inset-0 z-[58] bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
              mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onClick={() => setMobileOpen(false)}
          />

          <aside
            className={`fixed left-0 top-0 z-[60] h-full w-[86vw] max-w-[340px] transition-transform duration-300 ease-out ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <Navbar />

        <div className="min-h-0 flex-1 overflow-hidden pt-[calc(4rem+env(safe-area-inset-top))]">
          <MainLayout>{children}</MainLayout>
        </div>
      </div>

      {!isDesktop ? (
        <>
          <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-20 bg-gradient-to-t from-[color:var(--background)] to-transparent" />
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
            <div className="grid grid-cols-5 gap-1">
              {mobileBottomTabs.map((tab) => {
                const Icon = tab.icon;

                if (tab.to) {
                  return (
                    <Link
                      key={tab.key}
                      to={tab.to}
                      onClick={tab.onClick}
                      className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors ${
                        tab.active
                          ? 'text-[color:var(--primary)]'
                          : 'text-[color:var(--foreground-muted)]'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={tab.action}
                    className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors ${
                      tab.active
                        ? 'text-[color:var(--primary)]'
                        : 'text-[color:var(--foreground-muted)]'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div
            className={`fixed inset-x-3 bottom-[calc(4.6rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 shadow-2xl transition-all duration-300 ${
              isSearchSheetOpen
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-3 opacity-0'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                Búsqueda rápida
              </p>
              <Button
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={() => setIsSearchSheetOpen(false)}
              >
                Cerrar
              </Button>
            </div>
            <InventorySearchCombobox />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Sidebar;
