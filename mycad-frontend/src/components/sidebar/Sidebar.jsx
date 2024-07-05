import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import {
  FaTachometerAlt,
  FaCar,
  FaUserCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import AccountSidebar from './AccountSidebar';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="py-4 h-full">
      <ProSidebar className="h-full">
        {user && (
          <>
            <AccountSidebar
              email={user.email}
              name={user.firstName + ' ' + user.lastName}
              photo={user.photo}
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
          {user && (
            <MenuItem
              component={<Link onClick={logout} to={'/login'} />}
              icon={<FaSignOutAlt />}
            >
              Logout
            </MenuItem>
          )}
        </Menu>
      </ProSidebar>
    </div>
  );
};

export default Sidebar;
