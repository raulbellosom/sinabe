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
    'rounded-full',
    'text-white',
    'text-2xl',
    'font-bold',
  );
  return (
    <div className="p-4 h-fit space-y-5">
      <div
        className={`w-full overflow-hidden whitespace-nowrap text-nowrap flex justify-start gap-4 items-center`}
      >
        <img src={MyCAD_ICON} alt="MyCAD ICON" className={logoClasses} />
        <span
          className={`text-2xl text-orange-500 font-extrabold mb-2 truncate`}
        >
          MyCAD
        </span>
      </div>
      <div
        className={classNames(
          'w-full whitespace-nowrap overflow-hidden flex justify-start gap-4 items-center',
        )}
      >
        <img
          src={photo || 'https://via.placeholder.com/150'}
          alt="User Photo"
          className={`w-10 h-10 mt-2 rounded-full bg-stone-400`}
        />
        <div className={'truncate whitespace-nowrap text-nowrap'}>
          <h2
            className={classNames(
              'text-lg font-bold text-indigo-900 w-full truncate',
            )}
          >
            {name}
          </h2>
          <p className={classNames('text-neutral-500 w-full truncate text-xs')}>
            {role}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSidebar;
