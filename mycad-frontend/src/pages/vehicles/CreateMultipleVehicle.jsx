import React, { useState } from 'react';
import uploadFilesImage from '../../assets/images/upload_files.jpg';
import { Button, FileInput, Spinner } from 'flowbite-react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { useVehicleContext } from '../../context/VehicleContext';
import { MdClose } from 'react-icons/md';
import { useAuthContext } from '../../context/AuthContext';

const CreateMultipleVehicle = () => {
  const { createMultipleVehicles } = useVehicleContext();
  const { user } = useAuthContext();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);

    await createMultipleVehicles(file, user?.id)
      .then((res) => {
        setFile(null);
        setError(null);
      })
      .catch((err) => {
        console.log(err);
        setError(err?.response?.data?.errors || 'Error al cargar el archivo');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="h-full bg-white">
      <div className="flex flex-col items-center justify-center">
        <img src={uploadFilesImage} alt="Upload files" className="w-1/4" />
        <h1 className="text-3xl font-bold text-center mt-4">
          Cargar múltiples vehículos
        </h1>
        <p className="text-center text-lg text-neutral-500 mt-1">
          Cargue un archivo CSV con la información de los vehículos
        </p>
        {/* instrucciones */}
        <div className="w-full md:w-4/5 mt-4">
          <p className="text-lg font-bold">Instrucciones:</p>
          <ol className="list-decimal pl-4">
            <li>
              Descargue la plantilla de vehículos y complete la información
              solicitada.
            </li>
            <li>
              Rellene la información de los vehículos en la plantilla descargada
              conservando las cabeceras originales del archivo.
            </li>
            <li>
              Cargue el archivo CSV con la información de los vehículos y de
              clic en el boton de Cargar Archivo.
            </li>
          </ol>
        </div>
        <div className="mt-4 ">
          <form className="w-full flex flex-col gap-4">
            <FileInput
              onChange={(e) => setFile(e.target.files[0])}
              type="file"
              accept=".csv"
            />
            <Button
              onClick={handleSubmit}
              outline
              className="flex items-center"
              disabled={!file || loading}
            >
              {loading ? (
                <Spinner aria-label="Spinner button example" size="sm" />
              ) : (
                <>
                  <span>
                    <FaCloudUploadAlt size={20} className="mr-2" />
                  </span>
                  <span>Cargar Archivo</span>
                </>
              )}
            </Button>
          </form>
        </div>
        {
          <div className="mt-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <div className="flex justify-end">
                  <span
                    className="cursor-pointer hover:bg-red-200 rounded-full p-1"
                    onClick={() => setError(null)}
                  >
                    <MdClose size={20} className="text-red-500" />
                  </span>
                </div>
                <ul>
                  {error && typeof error === 'string' ? (
                    <li>{error}</li>
                  ) : (
                    error?.map((err, index) => <li key={index}>{err}</li>)
                  )}
                </ul>
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );
};

export default CreateMultipleVehicle;
