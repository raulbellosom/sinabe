import React from 'react';
import { Button } from 'flowbite-react';
import { FaSignOutAlt } from 'react-icons/fa';
import classNames from 'classnames';

const AccountSidebar = ({ name, email, photo, btnOnClick, collapsed }) => {
  const logoClasses = classNames(
    'w-9',
    'min-w-9',
    'h-9',
    'min-h-9',
    'flex',
    'items-center',
    'justify-center',
    'rounded-md rounded-r-none',
    'text-white',
    'text-2xl',
    'font-bold',
    'bg-gradient-to-r',
    'from-orange-600',
    'to-orange-300',
    'ml-2.5 mb-2.5 mt-2.5',
  );
  return (
    <div className="flex flex-col items-center pt-2">
      <div className="w-full">
        {collapsed ? (
          <p className={logoClasses}>M</p>
        ) : (
          <div className="flex justify-center items-center">
            <p className="font-extrabold text-2xl text-orange-400 flex items-center">
              <span className={logoClasses}>M</span>
              <span className="text-orange-400 border border-orange-400 h-9 w-auto px-2 rounded-r-md rounded-l-none mr-2.5 mb-2.5 mt-2.5">
                MYCAD
              </span>
            </p>
          </div>
        )}
      </div>
      <img
        src={photo || 'https://via.placeholder.com/150'}
        alt="User Photo"
        className="w-16 h-16 rounded-full mb-2"
      />
      <h2 className="text-xl font-bold mb-1 text-orange-500">{name}</h2>
      <p className="text-gray-500 mb-2">{email}</p>
      <Button type="button" onClick={btnOnClick} outline color="light">
        <FaSignOutAlt className="mr-2 h-5 w-5" />
        Cerrar Sesión
      </Button>
    </div>
  );
};

export default AccountSidebar;
