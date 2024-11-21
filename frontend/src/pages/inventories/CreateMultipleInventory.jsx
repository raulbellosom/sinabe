import React, { useState, useRef } from 'react';
import uploadFilesImage from '../../assets/images/upload_files.jpg';
import { Button, FileInput, Spinner } from 'flowbite-react';
import { FaCloudUploadAlt, FaDownload } from 'react-icons/fa';
import { useInventoryContext } from '../../context/InventoryContext';
import { MdClose } from 'react-icons/md';
import { useAuthContext } from '../../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const CreateMultipleInventory = () => {
  const ref = useRef(null);
  const { createMultipleInventories } = useInventoryContext();
  const { user } = useAuthContext();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdInventories, setCreatedInventories] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    await createMultipleInventories(file, user?.id)
      .then((res) => {
        setFile(null);
        setCreatedInventories(res?.createdInventories);
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
          Cargar múltiples inventarios
        </h1>
        <p className="text-center text-lg text-neutral-500 mt-1">
          Cargue un archivo CSV con la información de los inventarios
        </p>
        {/* instrucciones */}
        <div className="w-full md:w-4/5 mt-4">
          <p className="text-base font-bold">Instrucciones:</p>
          <ol className="list-decimal text-sm pl-4">
            <li>
              Descargue la plantilla de inventarios y complete la información
              solicitada. <br />
              <a
                href="/files/inventories_template.csv"
                download="inventories_template.csv"
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
              Rellene la información de los inventarios en la plantilla
              descargada.
            </li>
            <li>
              Cargue el archivo CSV con la información de los inventarios y de
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
        {createdInventories && (
          <div className="mt-4 w-full">
            <div className="bg-green-100 w-full border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <div className="flex justify-between items-center gap-2">
                <p className="font-bold">Inventarios creados con éxito</p>
                <span
                  className="cursor-pointer hover:bg-green-200 rounded-full p-1"
                  onClick={() => setCreatedInventories(null)}
                >
                  <MdClose size={20} className="text-green-500" />
                </span>
              </div>
              <ul className="p-2">
                {createdInventories &&
                  createdInventories.map((inventory, index) => (
                    <li className="list-disc" key={index}>
                      Inventorio{' '}
                      {`${inventory?.model?.name}
                    - ${inventory?.model?.type?.name} ${inventory?.model?.brand?.name}`}{' '}
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

export default CreateMultipleInventory;
