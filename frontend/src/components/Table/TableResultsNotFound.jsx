import React from 'react';
import Image from '../../assets/images/results_not_found.webp';

const TableResultsNotFound = () => {
  return (
    <div className="w-full h-full text-wrap flex flex-col items-center justify-center">
      <img
        src={Image}
        alt="No se encontraron resultados"
        className="w-1/2 md:w-1/4"
      />
      <h1 className="text-base md:text-lg lg:text-3xl font-bold text-center mt-4">
        No se encontraron resultados
      </h1>
      <p className="text-center text-base md:text-lg text-neutral-500 mt-1">
        No se encontraron resultados para la búsqueda realizada
      </p>
    </div>
  );
};

export default React.memo(TableResultsNotFound);
