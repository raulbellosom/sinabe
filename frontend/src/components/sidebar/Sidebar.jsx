import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
  menuClasses,
  SubMenu,
} from 'react-pro-sidebar';
import {
  FaTachometerAlt,
  FaUserCircle,
  FaUserShield,
  FaBoxes,
  FaClipboardList,
  FaFileInvoice,
} from 'react-icons/fa';
import { useAuthContext } from '../../context/AuthContext';
import { useUserPreference } from '../../context/UserPreferenceContext';
import AccountSidebar from './AccountSidebar';
import BgPattern1 from '../../assets/bg/bg_sidebar_1.png';
import BgPattern2 from '../../assets/bg/bg_sidebar_2.png';
import BgPattern3 from '../../assets/bg/bg_sidebar_3.png';
import BgPattern4 from '../../assets/bg/bg_sidebar_4.png';
import Navbar from '../navbar/Navbar';
import MainLayout from '../../Layout/MainLayout';
import { MdAddBox, MdAdminPanelSettings, MdInventory } from 'react-icons/md';
import useCheckPermissions from '../../hooks/useCheckPermissions';
import { FaDiagramProject, FaSitemap } from 'react-icons/fa6';
import { LuArchiveRestore } from 'react-icons/lu';
import { AiOutlineFieldNumber } from 'react-icons/ai';
import { PiInvoiceBold } from 'react-icons/pi';

const themes = {
  light: {
    sidebar: {
      backgroundColor: '#0D0D0D',
      color: '#ffffff',
    },
    menu: {
      menuContent: '#0D0D0D',
      icon: '#ffffff',
      hover: {
        backgroundColor: '#7e3af2',
        color: '#fff',
      },
      disabled: {
        color: '#9fb6cf',
      },
      active: {
        color: '#FFF',
        backgroundColor: '#7e3af2',
      },
    },
  },
  dark: {
    sidebar: {
      backgroundColor: '#0b2948',
      color: '#8ba1b7',
    },
    menu: {
      menuContent: '#082440',
      icon: '#59d0ff',
      hover: {
        backgroundColor: '#00458b',
        color: '#b6c8d9',
      },
      disabled: {
        color: '#3e5e7e',
      },
    },
  },
};

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Sidebar = ({ children }) => {
  const location = useLocation();
  const { user } = useAuthContext();
  const { preferences } = useUserPreference();
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [broken, setBroken] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [hasImage, setHasImage] = useState(true);
  const [theme, setTheme] = useState('light');

  const handleRTLChange = (e) => {
    setRtl(e.target.checked);
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.checked ? 'dark' : 'light');
  };

  const getSidebarImage = () => {
    if (preferences?.sidebarBgUrl) {
      const raw = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const apiUrl = raw.endsWith('/api') ? raw : `${raw}/api`;
      const relativePath = preferences.sidebarBgUrl.replace(/^uploads\//, '');
      return `${apiUrl}/uploads/${relativePath}`;
    }
    if (preferences?.sidebarBgId) {
      switch (preferences.sidebarBgId) {
        case 1:
          return BgPattern1;
        case 2:
          return BgPattern2;
        case 3:
          return BgPattern3;
        case 4:
          return BgPattern4;
        default:
          return BgPattern1;
      }
    }
    return BgPattern1;
  };

  const handleImageChange = (e) => {
    setHasImage(e.target.checked);
  };

  const menuItemStyles = {
    root: {
      fontSize: '16px',
      fontWeight: 600,
    },
    icon: {
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
      [`&.${menuClasses.active}`]: {
        color: themes[theme].menu.active.color,
      },
    },
    subMenuContent: ({ level }) => ({
      backgroundColor:
        level === 0
          ? hexToRgba(
              themes[theme].menu.menuContent,
              hasImage && !collapsed ? 0.15 : 1,
            )
          : '',
    }),
    SubMenuExpandIcon: {
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      transform: ' scale(1.75)',
    },
    button: {
      [`&:hover, &${menuClasses.SubMenuExpandIcon}`]: {
        backgroundColor: hexToRgba(
          themes[theme].menu.hover.backgroundColor,
          hasImage ? 0.75 : 1,
        ),
        color: themes[theme].menu.hover.color,
      },
      [`&.ps-active`]: {
        backgroundColor: hexToRgba(
          themes[theme].menu.active.backgroundColor,
          hasImage ? 0.75 : 1,
        ),
        color: themes[theme].menu.active.color,
      },
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
    },

    label: ({ open }) => ({
      fontWeight: open ? 600 : undefined,
    }),
  };

  const isActivePath = (path) => {
    const currentPath = location.pathname;

    if (currentPath === '/' && path === '/dashboard') {
      return true;
    }

    if (currentPath === path) {
      return true;
    }

    if (
      path !== '/' &&
      currentPath.startsWith(path) &&
      currentPath.length > path.length &&
      currentPath[path.length] === '/'
    ) {
      return false;
    }

    return false;
  };

  const isDashBoardPermission = useCheckPermissions('view_dashboard');
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

  const isCatalogsPermission =
    isModelsPermission.hasPermission ||
    isBrandsPermission.hasPermission ||
    isTypesPermission.hasPermission ||
    isConditionsPermission.hasPermission;

  return (
    <div
      style={{
        display: 'flex',
        direction: rtl ? 'rtl' : 'ltr',
        height: '100dvh',
      }}
    >
      <ProSidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        onBreakPoint={setBroken}
        image={getSidebarImage()}
        rtl={rtl}
        breakPoint="lg"
        backgroundColor={hexToRgba(
          themes[theme].sidebar.backgroundColor,
          hasImage ? 0.1 : 1,
        )}
        rootStyles={{
          color: themes[theme].sidebar.color,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <AccountSidebar
              role={user.email}
              name={user.firstName + ' ' + user.lastName}
              photo={user.photo}
              collapsed={collapsed}
              broken={broken}
            />
            <div className="border-t border-gray-300 py-1" />
            <Menu menuItemStyles={menuItemStyles}>
              {isDashBoardPermission.hasPermission && (
                <MenuItem
                  component={<Link to={'/dashboard'} />}
                  active={isActivePath('/dashboard')}
                  icon={<FaTachometerAlt size={23} />}
                >
                  Dashboard
                </MenuItem>
              )}
              {(isCatalogsPermission ||
                isInventoriesPermission.hasPermission ||
                isSelfInventoriesPermission.hasPermission) && (
                <SubMenu label="Inventarios" icon={<MdInventory size={23} />}>
                  {isCreateInventoryPermission.hasPermission && (
                    <MenuItem
                      icon={<MdAddBox size={23} />}
                      active={isActivePath('/inventories/create')}
                      component={<Link to={'/inventories/create'} />}
                      onClick={() => {
                        setToggled(false);
                      }}
                    >
                      Nuevo Inventario
                    </MenuItem>
                  )}
                  {(isInventoriesPermission.hasPermission ||
                    isSelfInventoriesPermission.hasPermission) && (
                    <MenuItem
                      icon={<FaClipboardList size={23} />}
                      active={isActivePath('/inventories')}
                      component={<Link to={'/inventories'} />}
                      onClick={() => {
                        setToggled(false);
                      }}
                    >
                      Inventarios
                    </MenuItem>
                  )}
                  {isCreateInventoryPermission.hasPermission && (
                    <MenuItem
                      icon={<FaFileInvoice size={23} />}
                      active={isActivePath('/custody')}
                      component={<Link to={'/custody'} />}
                      onClick={() => {
                        setToggled(false);
                      }}
                    >
                      Resguardos TI
                    </MenuItem>
                  )}
                  {isCatalogsPermission && (
                    <MenuItem
                      icon={<FaBoxes size={23} />}
                      active={isActivePath('/catalogs')}
                      component={<Link to={'/catalogs'} />}
                      onClick={() => {
                        setToggled(false);
                      }}
                    >
                      Catálogos
                    </MenuItem>
                  )}
                  {(isInventoriesPermission.hasPermission ||
                    isSelfInventoriesPermission.hasPermission) && (
                    <MenuItem
                      icon={<LuArchiveRestore size={23} />}
                      active={isActivePath('/inventories/decommissioning')}
                      component={<Link to={'/inventories/decommissioning'} />}
                      onClick={() => {
                        setToggled(false);
                      }}
                    >
                      Bajas
                    </MenuItem>
                  )}
                  {/* <MenuItem
                    icon={<LuArchiveRestore size={23} />}
                    active={isActivePath('/inventories/migrate')}
                    component={<Link to={'/inventories/migrate'} />}
                    onClick={() => {
                      setToggled(false);
                    }}
                  >
                    Migración
                  </MenuItem> */}
                </SubMenu>
              )}
              <SubMenu label="Finanzas" icon={<PiInvoiceBold size={23} />}>
                <MenuItem
                  icon={<FaClipboardList size={23} />}
                  active={isActivePath('/purchase-orders')}
                  component={<Link to={'/purchase-orders'} />}
                  onClick={() => {
                    setToggled(false);
                  }}
                >
                  OC
                </MenuItem>
                <MenuItem
                  icon={<FaFileInvoice size={23} />}
                  active={isActivePath('/invoices')}
                  component={<Link to={'/invoices'} />}
                  onClick={() => {
                    setToggled(false);
                  }}
                >
                  Facturas
                </MenuItem>
                <MenuItem
                  icon={<AiOutlineFieldNumber size={23} />}
                  active={isActivePath('/fixed-assets')}
                  component={<Link to={'/fixed-assets'} />}
                  onClick={() => {
                    setToggled(false);
                  }}
                >
                  Activos
                </MenuItem>
              </SubMenu>
              <MenuItem
                icon={<FaSitemap size={23} />}
                active={isActivePath('/verticals')}
                component={<Link to={'/verticals'} />}
                onClick={() => {
                  setToggled(false);
                }}
              >
                Verticales
              </MenuItem>
              <MenuItem
                icon={<FaDiagramProject size={23} />}
                active={isActivePath('/projects')}
                component={<Link to={'/projects'} />}
                onClick={() => {
                  setToggled(false);
                }}
              >
                Proyectos
              </MenuItem>
              {(isUsersPermission.hasPermission ||
                isRolesPermission.hasPermission) && (
                <SubMenu
                  label="Usuarios"
                  icon={<MdAdminPanelSettings size={23} />}
                >
                  {isUsersPermission.hasPermission && (
                    <MenuItem
                      component={<Link to={'/users'} />}
                      active={isActivePath('/users')}
                      icon={<FaUserCircle size={23} />}
                    >
                      Usuarios
                    </MenuItem>
                  )}
                  {isRolesPermission.hasPermission && (
                    <MenuItem
                      component={<Link to={'/roles'} />}
                      active={isActivePath('/roles')}
                      icon={<FaUserShield size={23} />}
                    >
                      Roles
                    </MenuItem>
                  )}
                </SubMenu>
              )}
            </Menu>
          </div>
        </div>
      </ProSidebar>
      <div className="flex-1 min-h-0 max-h-dvh overflow-hidden relative">
        <Navbar
          collapsed={collapsed}
          setCollapsed={() => setCollapsed(!collapsed)}
          toggled={toggled}
          setToggled={() => setToggled(!toggled)}
          broken={broken}
          user={user}
        />
        <div className="flex-1 overflow-auto pt-[calc(4rem+env(safe-area-inset-top))] h-full">
          <MainLayout>{children}</MainLayout>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
