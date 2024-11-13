import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import classNames from 'classnames';
import Notifies from '../../Notifies/Notifies';

const InventoryProperty = ({ label, value, icon: Icon }) => {
  const formattedValue =
    value && typeof value === 'string'
      ? value.replace(/\n/g, '<br />')
      : String(value);

  const handleDoubleClick = () => {
    Notifies('success', `Campo ${label} copiado al portapapeles`);
    navigator.clipboard.writeText(value);
  };

  if (label === 'Estado') {
    value = value === 'PROPUESTA' ? 'PROPUESTA DE BAJA' : value;
    return (
      <div
        onDoubleClick={() => handleDoubleClick()}
        className="flex flex-col h-full text-nowrap"
      >
        <h2 className="text-sm 2xl:text-base font-semibold h-7">{label}</h2>
        <p
          className={classNames(
            'text-xs md:text-sm 2xl:text-base p-1.5 rounded-md text-white flex items-center gap-2 justify-start min-h-6',
            {
              'bg-mycad-primary': value === 'ALTA',
              'bg-mycad-danger': value === 'BAJA',
              'bg-mycad-warning': value === 'PROPUESTA DE BAJA',
            },
          )}
        >
          {Icon && (
            <i>
              <Icon size={22} className="inline" />
            </i>
          )}
          <span dangerouslySetInnerHTML={{ __html: formattedValue }} />
        </p>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={() => handleDoubleClick()}
      className="flex flex-col h-full text-nowrap"
    >
      <h2 className="text-sm 2xl:text-base font-semibold h-7">{label}</h2>
      <p className="text-xs md:text-sm 2xl:text-base p-1.5 flex items-center gap-2 justify-start min-h-6 border-b border-neutral-100 pb-1">
        {Icon && (
          <i>
            <Icon size={22} className="inline text-purple-500" />
          </i>
        )}
        <span dangerouslySetInnerHTML={{ __html: formattedValue }} />
      </p>
    </div>
  );
};

InventoryProperty.Skeleton = function InventoryPropertySkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-6 rounded-md w-1/3" />
      <Skeleton className="h-5 rounded-md w-full" />
    </div>
  );
};
export default InventoryProperty;
