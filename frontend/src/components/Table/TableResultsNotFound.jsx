import React from 'react';
import Image from '../../assets/images/results_not_found.webp';

const TableResultsNotFound = () => {
  return (
    <div className="w-full h-full text-wrap flex flex-col items-center justify-center">
      <img src={Image} alt="No se encontraron resultados" className="w-1/4" />
      <h1 className="text-base md:text-lg 2xl:text-2xl font-bold text-center mt-2">
        No se encontraron resultados
      </h1>
      <p className="text-center text-xs  text-neutral-500">
        No se encontraron resultados para la búsqueda realizada
      </p>
    </div>
  );
};

export default React.memo(TableResultsNotFound);
