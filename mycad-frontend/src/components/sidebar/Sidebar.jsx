import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
  menuClasses,
} from 'react-pro-sidebar';
import {
  FaTachometerAlt,
  FaCar,
  FaUserCircle,
  FaSignOutAlt,
  FaUserEdit,
} from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import AccountSidebar from './AccountSidebar';
import BgPattern from '../../assets/bg/pattern-randomized.png';
import { Button } from 'flowbite-react';
import Navbar from '../navbar/Navbar';

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
  const { user, logout } = useContext(AuthContext);
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
      fontSize: '13px',
      fontWeight: 400,
    },
    icon: {
      color: themes[theme].menu.icon,
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
    },
    SubMenuExpandIcon: {
      color: '#b6b7b9',
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
    button: {
      [`&.${menuClasses.disabled}`]: {
        color: themes[theme].menu.disabled.color,
      },
      '&:hover': {
        backgroundColor: hexToRgba(
          themes[theme].menu.hover.backgroundColor,
          hasImage ? 0.8 : 1,
        ),
        color: themes[theme].menu.hover.color,
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
      }}
      className="relative w-full h-full min-h-dvh overflow-hidden bg-gray-100 dark:bg-gray-900"
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
            <Menu
              menuItemStyles={{
                root: {
                  fontSize: '16px',
                  fontWeight: 600,
                },
                button: {
                  ['&:hover']: {
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
              }}
            >
              <MenuItem
                component={<Link to={'/profile'} />}
                active={isActivePath('/profile')}
                icon={<FaUserEdit />}
              >
                Editar Perfil
              </MenuItem>
              <MenuItem
                component={<Link to={'/dashboard'} />}
                active={isActivePath('/dashboard')}
                icon={<FaTachometerAlt />}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                component={<Link to={'/vehicles'} />}
                active={isActivePath('/vehicles')}
                icon={<FaCar />}
              >
                Vehicles
              </MenuItem>
              <MenuItem
                component={<Link to={'/users'} />}
                active={isActivePath('/users')}
                icon={<FaUserCircle />}
              >
                Users
              </MenuItem>
            </Menu>
          </div>
          <div className="p-4">
            <Button
              type="button"
              gradientMonochrome="purple"
              className="w-full border-none truncate flex justify-start items-centertext-white transition-colors duration-100 ease-in-out"
              onClick={logout}
            >
              <FaSignOutAlt className="text-lg mt-0.5 mr-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </ProSidebar>
      <div className="w-full min-h-dvh h-screen max-h-dvh relative flex flex-col overflow-hidden">
        <Navbar
          collapsed={collapsed}
          setCollapsed={() => setCollapsed(!collapsed)}
          toggled={toggled}
          setToggled={() => setToggled(!toggled)}
          broken={broken}
        />
        <main className="flex-1 overflow-y-auto pt-16 h-full">
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
