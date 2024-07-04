import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar as ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { FaTachometerAlt, FaCar, FaUserCircle } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  return (
    <ProSidebar>
      <Menu>
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
    </ProSidebar>
  );
};

export default Sidebar;
