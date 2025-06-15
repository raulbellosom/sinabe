import { memo, useCallback, useEffect } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import classNames from 'classnames';

import { CustomToolbar } from './CustomToolbar'; // Componente de barra de herramientas extraído
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';
import { downloadFile } from '../../services/api';

import { IoClose } from 'react-icons/io5';
import NoImageFound from '../../assets/images/NoImageFound.jpg';

import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-photo-view/dist/react-photo-view.css';

// Función helper para no repetir la lógica de obtención de URL
const getImageSrc = (image) => {
  if (!image) return NoImageFound;
  if (image instanceof File) {
    return FormattedUrlImage(image);
  }
  return FormattedUrlImage(image.url || image.thumbnail || image);
};

const ImageViewer = ({
  images = [],
  onRemove,
  isDownloadable = true,
  renderMenuOptions = [],
  containerClassNames,
  imageStyles,
}) => {
  // Manejo de memoria para URLs de tipo File
  useEffect(() => {
    const objectUrls = images
      .filter((img) => img instanceof File)
      .map(FormattedUrlImage);

    // Función de limpieza para revocar las URLs y evitar memory leaks
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleDownloadImage = useCallback((img) => {
    downloadFile(img);
  }, []);

  return (
    <PhotoProvider
      maskOpacity={0.8}
      maskClosable={false}
      loop={images.length > 1}
      speed={() => 300}
      easing={(type) =>
        type === 2
          ? 'cubic-bezier(0.36, 0, 0.66, -0.56)'
          : 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
      toolbarRender={(props) => (
        <CustomToolbar
          {...props}
          images={images}
          isDownloadable={isDownloadable}
          onDownload={handleDownloadImage}
          customOptions={renderMenuOptions}
        />
      )}
      brokenElement={
        <img
          className="w-80 h-auto rounded-lg object-cover"
          src={NoImageFound}
          alt="NoImageFound"
        />
      }
    >
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => {
          // Usar una key única si es posible (ej: image.id o la URL)
          const key = image.id || getImageSrc(image) || index;
          const imageSrc = getImageSrc(image);

          return (
            <PhotoView key={key} src={imageSrc}>
              <div
                className={classNames(
                  'relative w-24 h-24 xl:h-28 xl:w-28 2xl:h-32 2xl:w-32 group',
                  containerClassNames,
                )}
              >
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(image.id || index); // Devolver el ID o el índice
                    }}
                    className="absolute top-1 right-1 z-10 p-1 bg-white rounded-full shadow-md text-gray-700 transition-all duration-300 transform scale-0 group-hover:scale-100 hover:bg-red-500 hover:text-white"
                  >
                    <IoClose size={18} />
                  </button>
                )}
                <LazyLoadImage
                  src={imageSrc}
                  alt={`Image ${index + 1}`}
                  effect="blur"
                  className="w-full h-full object-cover cursor-pointer shadow-md rounded-lg"
                  style={imageStyles}
                />
              </div>
            </PhotoView>
          );
        })}
      </div>
    </PhotoProvider>
  );
};

// Envolver el componente en memo para evitar re-renderizados innecesarios
export default memo(ImageViewer);
