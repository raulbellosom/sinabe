import React from 'react';
import uploadFilesImage from '../../assets/images/upload_files.jpg';
import { Button, FileInput } from 'flowbite-react';

const CreateMultipleVehicle = () => {
  return (
    <div className="h-full bg-white">
      <div className="flex flex-col items-center justify-center">
        <img src={uploadFilesImage} alt="Upload files" className="w-1/2" />
        <h1 className="text-3xl font-bold text-center mt-4">
          Cargar múltiples vehículos
        </h1>
        <p className="text-center text-lg text-neutral-500 mt-2">
          Cargue un archivo CSV con la información de los vehículos
        </p>
        <div className="mt-4">
          <FileInput type="file" accept=".csv" />
          <Button className="btn btn-primary">Cargar Archivo</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateMultipleVehicle;
