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
} from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import AccountSidebar from './AccountSidebar';
import MyCADLogo from '../../assets/logo/mycad_icon.png';
import { Button } from 'flowbite-react';
import { HiOutlineMenuAlt1 } from 'react-icons/hi';

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

const Sidebar = ({ collapsed = false, setCollapsed = () => {} }) => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [toggled, setToggled] = useState(false);
  const [broken, setBroken] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [hasImage, setHasImage] = useState(false);
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
      className="relative"
    >
      <Button
        type="button"
        onClick={() => (collapsed ? setCollapsed(false) : setCollapsed(true))}
        color="light"
        className="absolute top-2 -right-14 z-20 h-10 w-10 rounded-sm flex items-center justify-center"
        style={{ outline: 'none' }}
      >
        <HiOutlineMenuAlt1 />
      </Button>
      <ProSidebar
        collapsed={collapsed}
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        onBreakPoint={setBroken}
        image={MyCADLogo}
        rtl={rtl}
        breakPoint="md"
        backgroundColor={hexToRgba(
          themes[theme].sidebar.backgroundColor,
          hasImage ? 0.9 : 1,
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
            {user && (
              <>
                <AccountSidebar
                  role={user.roleId === 1 ? 'Admin' : 'User'}
                  name={user.firstName + ' ' + user.lastName}
                  photo={user.photo}
                  collapsed={collapsed}
                />
                <hr className="my-4" />
              </>
            )}
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
          <div className="p-5 pl-3">
            {collapsed ? (
              <Button
                type="button"
                className="w-full outline-none"
                onClick={logout}
                color="light"
              >
                <span className="h-5 outline-none">
                  <FaSignOutAlt className="w-4 h-4" />
                </span>
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full"
                onClick={logout}
                color="light"
              >
                <span className="flex justify-center items-center text-nowrap gap-2 h-5">
                  <FaSignOutAlt className="w-4 h-4" />
                  <span className={`font-semibold`}>Cerrar Sesión</span>
                </span>
              </Button>
            )}
          </div>
        </div>
      </ProSidebar>
    </div>
  );
};

export default Sidebar;
