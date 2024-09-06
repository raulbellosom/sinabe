import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL, downloadFile, getVehicle } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import VehicleProperty from '../../components/VehicleComponents/VehicleView/VehicleProperty';
import ModalRemove from '../../components/Modals/ModalRemove';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import { FaCar, FaTachometerAlt } from 'react-icons/fa';
import { PiTrademarkRegisteredBold } from 'react-icons/pi';
import {
  MdOutlineDirectionsCar,
  MdInfo,
  MdCalendarToday,
  MdOutlineTextsms,
  MdOutlineNumbers,
} from 'react-icons/md';
import { TbNumber123 } from 'react-icons/tb';
import { AiOutlineFieldNumber } from 'react-icons/ai';
import { BiCategory, BiDollar } from 'react-icons/bi';
import { MdGarage } from 'react-icons/md';
import { Badge } from 'flowbite-react';
import classNames from 'classnames';
import { useVehicleContext } from '../../context/VehicleContext';
import { IoCopyOutline } from 'react-icons/io5';
import formatFileData from '../../utils/fileDataFormatter';
import { parseToCurrency, parseToLocalDate } from '../../utils/formatValues';
const ActionButtons = React.lazy(
  () => import('../../components/ActionButtons/ActionButtons'),
);
const FileIcon = React.lazy(() => import('../../components/FileIcon/FileIcon'));

const ViewVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteVehicle } = useVehicleContext();
  // const { refetch, isFetching } = fetchVehicle({id: id})
  const [vehicleData, setVehicleData] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const {
    data: vehicle,
    refetch,
    isFetching,
    isPending,
  } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: ({ signal }) => getVehicle({ id, signal }),
  });

  useEffect(() => {
    const data = {
      model: {
        name: vehicle?.model?.name,
        icon: MdOutlineDirectionsCar,
        label: 'Modelo',
      },
      brand: {
        name: vehicle?.model?.brand?.name,
        icon: PiTrademarkRegisteredBold,
        label: 'Marca',
      },
      type: {
        name: vehicle?.model?.type?.name,
        icon: BiCategory,
        label: 'Tipo de Vehículo',
      },
      year: {
        name: vehicle?.model?.year,
        icon: MdGarage,
        label: 'Año del Modelo',
      },
      plateNumber: {
        name: vehicle?.plateNumber,
        icon: AiOutlineFieldNumber,
        label: 'Número de Placa',
      },
      economicNumber: {
        name: vehicle?.economicNumber,
        icon: MdOutlineNumbers,
        label: 'Número Económico',
      },
      serialNumber: {
        name: vehicle?.serialNumber,
        icon: TbNumber123,
        label: 'Número de Serie',
      },
      acquisitionDate: {
        name: vehicle?.acquisitionDate
          ? parseToLocalDate(vehicle?.acquisitionDate)
          : '',
        icon: MdCalendarToday,
        label: 'Fecha de Adquisición',
      },
      mileage: {
        name: vehicle?.mileage,
        icon: FaTachometerAlt,
        label: 'Kilometraje',
      },
      status: {
        name: vehicle?.status ? 'Activo' : 'Inactivo',
        icon: MdInfo,
        label: 'Estado',
      },
      cost: {
        name: vehicle?.cost
          ? parseToCurrency(vehicle?.cost, vehicle?.costCurrency)
          : '',
        icon: BiDollar,
        label: 'Costo de Adquisición',
      },
      bookValue: {
        name: vehicle?.bookValue
          ? parseToCurrency(vehicle?.bookValue, vehicle?.bookValueCurrency)
          : '',
        icon: BiDollar,
        label: 'Valor en Libros',
      },
      currentMarketValue: {
        name: vehicle?.currentMarketValue
          ? parseToCurrency(
              vehicle?.currentMarketValue,
              vehicle?.marketValueCurrency,
            )
          : '',
        icon: BiDollar,
        label: 'Valor en el Mercado',
      },
      comments: {
        name: vehicle?.comments,
        icon: MdOutlineTextsms,
        label: 'Comentarios',
      },
    };
    setFiles(formatFileData(vehicle?.files || []));
    setImages(formatFileData(vehicle?.images || []));
    setVehicleData(data);
  }, [vehicle]);

  const onEdit = (e) => {
    if (e.ctrlKey) {
      window.open(`/vehicles/edit/${id}`, '_blank');
    } else {
      navigate(`/vehicles/edit/${id}`);
    }
  };

  const handleDeleteVehicle = () => {
    deleteVehicle(id);
    navigate('/vehicles');
  };

  const onRemove = () => {
    setIsOpenModal(true);
  };

  const onCreate = () => {
    navigate('/vehicles/create');
  };

  const handleShareImage = (img) => {
    const imgURL =
      img instanceof File ? URL.createObjectURL(img) : `${API_URL}/${img.url}`;
    navigator.clipboard.writeText(imgURL);
  };

  return (
    <div className="h-full bg-white p-4 rounded-md">
      <div className="w-full flex flex-col-reverse lg:flex-row items-center justify-between gap-4 pb-1">
        <div className="w-full rounded-md flex items-center justify-center lg:justify-start text-orange-500">
          <FaCar size={24} className="mr-4" />
          <h1 className="text-2xl font-bold">Detalles del Vehículo</h1>
        </div>
        <div className="w-full flex items-center justify-center lg:justify-end gap-2">
          <ActionButtons
            onEdit={onEdit}
            onCreate={onCreate}
            onRemove={onRemove}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center justify-start pb-4">
        {vehicle?.conditions &&
          vehicle?.conditions?.length > 0 &&
          vehicle?.conditions?.map((condition, index) => (
            <Badge size={'sm'} key={index} color="indigo">
              {condition.condition.name}
            </Badge>
          ))}
      </div>
      <div className="h-fit grid grid-cols-12 gap-4">
        <div className="h-full col-span-12 lg:col-span-6">
          <div className="grid gap-2 grid-cols-12 md:gap-4 w-full h-full">
            {isFetching && !vehicleData ? (
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="col-span-12">
                    <VehicleProperty.Skeleton />
                  </div>
                ))}
              </>
            ) : (
              Object?.keys(vehicleData) &&
              Object?.keys(vehicleData)?.map((key) => {
                const { name, icon, label } = vehicleData[key];
                return (
                  <div key={key} className="col-span-6 last:col-span-12">
                    <VehicleProperty label={label} value={name} icon={icon} />
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm 2xl:text-base font-semibold h-7">
                Archivos
              </h2>
              <div className="flex flex-col gap-2">
                {files && files?.length > 0 ? (
                  files.map((file, index) => (
                    <FileIcon key={index} file={file} />
                  ))
                ) : (
                  <p className="text-sm 2xl:text-base text-gray-500">
                    No hay archivos adjuntos
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-sm 2xl:text-base font-semibold h-7">
                Imágenes
              </h2>
              <div
                className={classNames(
                  'h-fit max-h-fit grid gap-2 overflow-y-auto',
                  images.length > 0
                    ? 'grid-cols-[repeat(auto-fill,_minmax(6rem,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(8rem,_1fr))]'
                    : '',
                )}
              >
                {images.length > 0 ? (
                  <ImageViewer
                    images={images}
                    renderMenuOptions={[
                      {
                        label: 'Copiar URL',
                        icon: IoCopyOutline,
                        onClick: (img) => handleShareImage(img),
                      },
                    ]}
                  />
                ) : (
                  <p className="text-sm 2xl:text-base text-gray-500">
                    El vehículo no tiene imágenes
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalRemove
        isOpenModal={isOpenModal}
        onCloseModal={() => setIsOpenModal(false)}
        removeFunction={handleDeleteVehicle}
      />
    </div>
  );
};

export default ViewVehicle;
