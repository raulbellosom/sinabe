import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const VehicleProperty = ({ label, value, icon: Icon }) => {
  const formattedValue =
    value && typeof value === 'string'
      ? value.replace(/\n/g, '<br />')
      : String(value);
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm md:text-base xl:text-lg font-semibold h-7">
        {label}
      </h2>
      <p className="text-sm lg:text-base flex items-center gap-2 justify-start min-h-6 border-b border-neutral-100 pb-1">
        {Icon && <Icon size={20} className="mr-2 inline text-orange-500" />}
        <span dangerouslySetInnerHTML={{ __html: formattedValue }} />
      </p>
    </div>
  );
};

VehicleProperty.Skeleton = function VehiclePropertySkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-6 rounded-md w-1/3" />
      <Skeleton className="h-5 rounded-md w-full" />
    </div>
  );
};
export default VehicleProperty;
