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
      backgroundColor: '#ffffff',
      color: '#607489',
    },
    menu: {
      menuContent: '#fbfcfd',
      icon: '#0098e5',
      hover: {
        backgroundColor: '#c5e4ff',
        color: '#44596e',
      },
      disabled: {
        color: '#9fb6cf',
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

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        direction: rtl ? 'rtl' : 'ltr',
      }}
      className="relative w-full h-full overflow-hidden bg-gray-100"
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
          hasImage ? 0 : 1,
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
            <Menu
              menuItemStyles={{
                button: {
                  [`&.active`]: {
                    backgroundColor: '#13395e',
                    color: '#b6c8d9',
                  },
                },
              }}
            >
              <MenuItem
                component={<Link to={'/'} />}
                active={location.pathname === '/'}
                icon={<FaUserEdit />}
              >
                Editar Perfil
              </MenuItem>
              <MenuItem
                component={<Link to={'/dashboard'} />}
                active={location.pathname === '/dashboard'}
                icon={<FaTachometerAlt />}
              >
                Dashboard
              </MenuItem>
              <MenuItem
                component={<Link to={'/vehicles'} />}
                active={location.pathname === '/vehicles'}
                icon={<FaCar />}
              >
                Vehicles
              </MenuItem>
              <MenuItem
                component={<Link to={'/users'} />}
                active={location.pathname === '/users'}
                icon={<FaUserCircle />}
              >
                Users
              </MenuItem>
            </Menu>
          </div>
          <div className="p-4">
            <Button
              type="button"
              color={'light'}
              className="w-full border-none truncate flex justify-start items-center bg-transparent text-gray-500 hover:text-gray-700"
              onClick={logout}
            >
              <FaSignOutAlt className="text-lg mt-0.5 mr-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </ProSidebar>
      <div className="w-full h-full">
        <Navbar
          collapsed={collapsed}
          setCollapsed={() => setCollapsed(!collapsed)}
          toggled={toggled}
          setToggled={() => setToggled(!toggled)}
          broken={broken}
        />
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
