import React, { useState } from 'react';
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
  FaCar,
  FaUserCircle,
  FaSignOutAlt,
  FaUserEdit,
} from 'react-icons/fa';
import { useAuthContext } from '../../context/AuthContext';
import AccountSidebar from './AccountSidebar';
import BgPattern from '../../assets/bg/pattern-randomized.png';
import { Button } from 'flowbite-react';
import Navbar from '../navbar/Navbar';
import MainLayout from '../../Layout/MainLayout';
import { BiCategory } from 'react-icons/bi';
import { MdGarage } from 'react-icons/md';

const themes = {
  light: {
    sidebar: {
      backgroundColor: '#F6E8DF',
      color: '#312e81',
    },
    menu: {
      menuContent: '#fbfcfd',
      icon: '#ff5a1f',
      hover: {
        backgroundColor: '#ff5a1f',
        color: '#fff',
      },
      disabled: {
        color: '#9fb6cf',
      },
      active: {
        color: '#FFF',
        backgroundColor: '#312e81',
      },
      hover: {
        backgroundColor: '#ff5a1f',
        color: '#fff',
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
  const { user, logout } = useAuthContext();
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
              hasImage && !collapsed ? 0.4 : 1,
            )
          : 'transparent',
    }),
    SubMenuExpandIcon: {
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      transform: ' scale(1.5)',
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
    const currentPath = path === '/' ? '/dashboard' : path;
    return location.pathname?.includes(currentPath);
  };

  return (
    <div
      style={{
        display: 'flex',
        direction: rtl ? 'rtl' : 'ltr',
        height: '100vh',
      }}
    >
      <ProSidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        onBreakPoint={setBroken}
        image={BgPattern}
        rtl={rtl}
        breakPoint="md"
        backgroundColor={hexToRgba(
          themes[theme].sidebar.backgroundColor,
          hasImage ? 0.15 : 1,
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
              // role={user.roleId === 1 ? 'Admin' : 'User'}
              role={user.email}
              name={user.firstName + ' ' + user.lastName}
              photo={user.photo}
              collapsed={collapsed}
            />
            <div className="border-t border-gray-300 py-1" />
            <Menu menuItemStyles={menuItemStyles}>
              <MenuItem
                component={<Link to={'/dashboard'} />}
                active={isActivePath('/dashboard')}
                icon={<FaTachometerAlt />}
              >
                Dashboard
              </MenuItem>
              <SubMenu label="Vehículos" icon={<MdGarage />}>
                <MenuItem
                  icon={<FaCar />}
                  active={isActivePath('/vehicles')}
                  component={<Link to={'/vehicles'} />}
                  onClick={() => {
                    setToggled(false);
                  }}
                >
                  Mis Vehículos
                </MenuItem>
                <MenuItem
                  icon={<BiCategory />}
                  active={isActivePath('/catalogs')}
                  component={<Link to={'/catalogs'} />}
                  onClick={() => {
                    setToggled(false);
                  }}
                >
                  Catálogos
                </MenuItem>
              </SubMenu>
              <MenuItem
                component={<Link to={'/users'} />}
                active={isActivePath('/users')}
                icon={<FaUserCircle />}
              >
                Usuarios
              </MenuItem>
              <MenuItem
                component={<Link to={'/profile'} />}
                active={isActivePath('/profile')}
                icon={<FaUserEdit />}
              >
                Editar Perfil
              </MenuItem>
            </Menu>
          </div>
          <div className="p-4">
            <Button
              type="button"
              gradientMonochrome="purple"
              className="w-full border-none truncate flex justify-start items-center text-white transition-colors duration-100 ease-in-out"
              onClick={logout}
            >
              <FaSignOutAlt className="text-lg mt-0.5 mr-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </ProSidebar>
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <Navbar
          collapsed={collapsed}
          setCollapsed={() => setCollapsed(!collapsed)}
          toggled={toggled}
          setToggled={() => setToggled(!toggled)}
          broken={broken}
        />
        <div className="flex-1 overflow-auto pt-16 h-full">
          <MainLayout>{children}</MainLayout>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
