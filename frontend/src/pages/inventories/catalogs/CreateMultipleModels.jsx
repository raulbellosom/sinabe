import React, { useState } from 'react';
import { Button, FileInput, Spinner } from 'flowbite-react';
import { FaCloudUploadAlt, FaDownload } from 'react-icons/fa';
import { useCatalogContext } from '../../../context/CatalogContext';
import { MdClose } from 'react-icons/md';

const CreateMultipleModels = () => {
  const { createMultipleModels } = useCatalogContext();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdModels, setCreatedModels] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await createMultipleModels(file);
      setFile(null);
      setCreatedModels(res?.createdModels);
      if (res?.errors?.length) {
        setError(res?.errors);
      } else {
        setError(null);
      }
    } catch (error) {
      console.log('err', error);
      setError(error?.response?.data?.errors || 'Error al cargar el archivo');
    }
    setLoading(false);
  };
  return (
    <div className="h-full w-full bg-white">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-center mt-4">
          Cargar múltiples modelos
        </h1>
        <p className="text-center text-lg text-neutral-500 mt-1">
          Cargue un archivo CSV con la información de los modelos
        </p>
        <div className="w-full md:w-4/5 mt-4">
          <p className="text-base font-bold">Instrucciones:</p>
          <ol className="list-decimal text-sm pl-4">
            <li>
              Descargue la plantilla de inventarios y complete la información
              solicitada. <br />
              <a
                href="/files/models_template.csv"
                download="models_template.csv"
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
        <div className="w-full md:w-4/5 mt-4">
          <FileInput
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
          />
        </div>
        <div className="mt-4">
          <Button
            onClick={handleSubmit}
            className="flex items-center"
            disabled={!file || loading}
            color={file ? 'blue' : 'neutral'}
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
        </div>
        {createdModels &&
          createdModels.length > 0 &&
          createdModels.map((model, index) => (
            <div
              key={index}
              className="w-full md:w-4/5 mt-4 bg-green-100 text-green-500 p-2 rounded"
            >
              {`(${model.year}) ${model.name} - ${model.brand.name} ${model.type.name}   creado exitosamente`}
            </div>
          ))}
        {error && (
          <div className="mt-4 bg-red-100 w-full border border-red-400 text-red-700 px-4 py-3 rounded relative">
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
    </div>
  );
};

export default CreateMultipleModels;
