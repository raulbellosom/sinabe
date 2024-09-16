import React, { useState, useRef } from 'react';
import uploadFilesImage from '../../assets/images/upload_files.jpg';
import { Button, FileInput, Spinner } from 'flowbite-react';
import { FaCloudUploadAlt, FaDownload } from 'react-icons/fa';
import { useVehicleContext } from '../../context/VehicleContext';
import { MdClose } from 'react-icons/md';
import { useAuthContext } from '../../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const CreateMultipleVehicle = () => {
  const ref = useRef(null);
  const { createMultipleVehicles } = useVehicleContext();
  const { user } = useAuthContext();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdVehicles, setCreatedVehicles] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    await createMultipleVehicles(file, user?.id)
      .then((res) => {
        setFile(null);
        setCreatedVehicles(res?.createdVehicles);
        if (res?.errors?.length) {
          setError(res?.errors);
        } else {
          setError(null);
        }
      })
      .catch((err) => {
        console.log('err', err);
        setError(err?.response?.data?.errors || 'Error al cargar el archivo');
      })
      .finally((data) => {
        setLoading(false);
        ref.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
      });
  };

  return (
    <div ref={ref} className="h-full w-full bg-white">
      <div className="flex flex-col items-center justify-center">
        <div className="w-1/2 md:w-1/4 flex justify-center">
          <LazyLoadImage
            effect="blur"
            src={uploadFilesImage}
            alt="Upload files"
            className="w-full"
          />
        </div>
        <h1 className="text-3xl font-bold text-center mt-4">
          Cargar múltiples vehículos
        </h1>
        <p className="text-center text-lg text-neutral-500 mt-1">
          Cargue un archivo CSV con la información de los vehículos
        </p>
        {/* instrucciones */}
        <div className="w-full md:w-4/5 mt-4">
          <p className="text-base font-bold">Instrucciones:</p>
          <ol className="list-decimal text-sm pl-4">
            <li>
              Descargue la plantilla de vehículos y complete la información
              solicitada. <br />
              <a
                href="/files/vehicles_template.csv"
                download="vehicles_template.csv"
                className="text-blue-500 font-bold"
              >
                <FaDownload size={18} className="mr-2 inline-flex" />
                Descargar plantilla
              </a>
            </li>
            <li>
              Remueva las filas de ejemplo de la plantilla descargada
              conservando las cabeceras originales del archivo.
            </li>
            <li>
              Rellene la información de los vehículos en la plantilla
              descargada.
            </li>
            <li>
              Cargue el archivo CSV con la información de los vehículos y de
              clic en el boton de Cargar Archivo.
            </li>
          </ol>
        </div>
        <div className="mt-4">
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
        {createdVehicles && (
          <div className="mt-4 w-full">
            <div className="bg-green-100 w-full border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <div className="flex justify-between items-center gap-2">
                <p className="font-bold">Vehículos creados con éxito</p>
                <span
                  className="cursor-pointer hover:bg-green-200 rounded-full p-1"
                  onClick={() => setCreatedVehicles(null)}
                >
                  <MdClose size={20} className="text-green-500" />
                </span>
              </div>
              <ul className="p-2">
                {createdVehicles &&
                  createdVehicles.map((vehicle, index) => (
                    <li className="list-disc" key={index}>
                      Vehículo{' '}
                      {`${vehicle?.model?.name} ${vehicle?.model?.year}
                    - ${vehicle?.model?.type?.name} ${vehicle?.model?.brand?.name}`}{' '}
                      creado con éxito
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
        {
          <div className="mt-4 w-full">
            {error && (
              <div className="bg-red-100 w-full border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <div className="flex justify-between items-center gap-2">
                  <p className="font-bold">
                    Error al crear los siguientes registros:
                  </p>
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
