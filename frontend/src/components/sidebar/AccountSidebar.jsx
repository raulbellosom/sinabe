import React from 'react';
import classNames from 'classnames';
import Icon from '../../assets/logo/sinabe_icon_white.png';
import ImageViewer from '../ImageViewer/ImageViewer';

const AccountSidebar = ({ name, role, photo, collapsed }) => {
  return (
    <div className="p-4 h-fit space-y-5">
      <div
        className={`w-full overflow-hidden whitespace-nowrap text-nowrap flex justify-start gap-4 items-center`}
      >
        <img src={Icon} alt="ICON" className="h-auto w-10" />
        <span className={`text-2xl text-white font-extrabold mb-2 truncate`}>
          SINABE
        </span>
      </div>
      <div
        className={classNames(
          'w-full whitespace-nowrap overflow-hidden flex justify-start gap-4 items-center',
        )}
      >
        <div className="flex justify-center items-center h-10 w-10 min-w-10 min-h-10 overflow-hidden rounded-full bg-stone-400">
          <ImageViewer
            images={photo ? [photo] : ['https://via.placeholder.com/150']}
            imageStyles={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
        <div className={'truncate whitespace-nowrap text-nowrap'}>
          <h2
            className={classNames(
              'text-sm font-bold text-purple-600 w-full truncate',
            )}
          >
            {name}
          </h2>
          <p className={classNames('text-white w-full truncate text-xs')}>
            {role}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSidebar;
