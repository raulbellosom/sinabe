import React from 'react';
import classNames from 'classnames';
import MyCAD_ICON from '../../assets/logo/mycad_icon.webp';

const AccountSidebar = ({ name, role, photo, collapsed }) => {
  const logoClasses = classNames(
    'w-auto',
    'min-w-10',
    'h-10',
    'flex',
    'items-center',
    'justify-center',
    'text-white',
    'text-2xl',
    'font-bold',
  );
  return (
    <div className="flex flex-col items-center pt-2 h-56">
      <div
        className={`w-full flex ${collapsed ? 'justify-center' : 'justify-start'} items-center gap-2 p-4`}
      >
        <img
          src={MyCAD_ICON}
          alt="MyCAD ICON"
          className={
            logoClasses + (collapsed ? ' rounded-full' : ' rounded-lg')
          }
        />
        <span
          className={`${collapsed && 'hidden'} text-3xl text-orange-500 font-extrabold`}
        >
          MyCAD
        </span>
      </div>
      <img
        src={photo || 'https://via.placeholder.com/150'}
        alt="User Photo"
        className={`${collapsed ? 'w-10 h-10' : 'w-16 h-16'} rounded-full mb-2`}
      />

      <h2
        className={classNames(
          'text-xl font-bold mb-1 text-orange-500',
          collapsed
            ? 'transition-all duration-75 transform translate-x-full hidden'
            : 'transition-all duration-500 transform translate-x-0 ease-in-out',
        )}
      >
        {name}
      </h2>
      <p
        className={classNames(
          'text-gray-500 mb-2',
          collapsed
            ? 'transition-all duration-75 transform translate-x-full hidden'
            : 'transition-all duration-500 transform translate-x-0 ease-in-out',
        )}
      >
        {role}
      </p>
    </div>
  );
};

export default AccountSidebar;
