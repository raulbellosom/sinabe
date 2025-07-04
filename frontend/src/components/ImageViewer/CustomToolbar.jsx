import { Dropdown } from 'flowbite-react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdSaveAlt } from 'react-icons/md';
import {
  ZoomInIcon,
  ZoomOutIcon,
  RotateLeftIcon,
  RotateRightIcon,
} from './Icons'; // Iconos SVG como componentes

export const CustomToolbar = ({
  onScale,
  scale,
  rotate,
  onRotate,
  isDownloadable,
  onDownload,
  customOptions = [],
  imageIndex,
}) => {
  return (
    <>
      {/* Iconos de Zoom y Rotación ahora son componentes limpios */}
      <ZoomOutIcon onClick={() => onScale(scale - 1)} />
      <ZoomInIcon onClick={() => onScale(scale + 1)} />
      <RotateLeftIcon onClick={() => onRotate(rotate - 90)} />
      <RotateRightIcon onClick={() => onRotate(rotate + 90)} />

      {/* Menú de opciones */}
      <span className="PhotoView-Slider__toolbarIcon text-white">
        <Dropdown
          label={<BsThreeDotsVertical size={20} />}
          dismissOnClick={true} // Es mejor que el menú se cierre al hacer clic
          inline
          arrowIcon={false}
          placement="top" // Posicionar mejor el dropdown
        >
          {isDownloadable && (
            <Dropdown.Item
              onClick={() => onDownload(imageIndex)}
              icon={MdSaveAlt}
            >
              Descargar
            </Dropdown.Item>
          )}
          {customOptions.map((option, idx) => (
            <Dropdown.Item
              key={idx}
              onClick={() => option.onClick(imageIndex)}
              icon={option.icon}
            >
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown>
      </span>
    </>
  );
};
