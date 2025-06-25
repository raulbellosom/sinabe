// ImageViewer2.jsx
import { memo, useCallback, useEffect } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import classNames from 'classnames';
import { Checkbox } from 'flowbite-react';

import { CustomToolbar } from './CustomToolbar';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';
import { downloadFile } from '../../services/api';
import { IoClose } from 'react-icons/io5';
import NoImageFound from '../../assets/images/NoImageFound.jpg';
import Notifies from '../Notifies/Notifies';

import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-photo-view/dist/react-photo-view.css';

const getImageSrc = (image, isThumbnail = false) => {
  if (!image) return NoImageFound;

  const sourceToFormat = isThumbnail
    ? image.thumbnail || image.url || image.path || image
    : image.url || image.path || image;

  const url = FormattedUrlImage(sourceToFormat);
  return url || NoImageFound;
};

const ImageViewer = ({
  images,
  onRemove,
  showOnlyFirstImage = false,
  showCheckboxes = false,
  onImageSelect,
  selectedImages = [],
  containerClassNames,
  imageStyles,
  isDownloadable = true,
}) => {
  const safeImages = Array.isArray(images) ? images : [];

  const handleSelectImage = useCallback(
    (imageId, isChecked) => {
      if (onImageSelect) {
        onImageSelect(imageId, isChecked);
      }
    },
    [onImageSelect],
  );

  useEffect(() => {
    return () => {
      safeImages.forEach((image) => {
        if (image instanceof File && image.objectURL) {
          URL.revokeObjectURL(image.objectURL);
        }
      });
    };
  }, [safeImages]);

  const handleDownload = useCallback(
    async (index) => {
      try {
        const imageUrl = safeImages[index];
        if (!imageUrl) {
          Notifies(
            'error',
            'No se encontró la URL de la imagen para descargar.',
          );
          return;
        }
        await downloadFile(imageUrl);
      } catch (error) {
        console.error('Error al descargar la imagen:', error);
        Notifies('error', 'Error al descargar la imagen.');
      }
    },
    [safeImages],
  );

  return (
    <PhotoProvider
      maskOpacity={0.8}
      pullClosable={false}
      maskClosable={false}
      loop={safeImages.length > 1}
      speed={() => 500}
      easing={(type) =>
        type === 3
          ? 'cubic-bezier(0.36, 0, 0.66, -0.56)'
          : 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
      toolbarRender={({ onScale, scale, onRotate, rotate, index }) => (
        <CustomToolbar
          onScale={onScale}
          scale={scale}
          onRotate={onRotate}
          rotate={rotate}
          isDownloadable={isDownloadable}
          onDownload={handleDownload}
          imageIndex={index}
          images={safeImages}
        />
      )}
    >
      <div className={containerClassNames}>
        {safeImages.map((image, index) => {
          // Mostrar solo la primera miniatura si showOnlyFirstImage es true
          if (showOnlyFirstImage && index !== 0) return null;

          const fullSrc = getImageSrc(image);
          const thumbSrc = getImageSrc(image, true);
          const isSelected = selectedImages.includes(image.id);

          return (
            <PhotoView key={image.id || index} src={fullSrc}>
              <div
                className={classNames(
                  'relative group flex items-center justify-center rounded-md overflow-hidden shadow-md transition-all duration-200',
                  'w-full h-full aspect-square',
                )}
              >
                {showCheckboxes && onImageSelect && (
                  <div
                    className="absolute top-1 left-1 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) =>
                        handleSelectImage(image.id, e.target.checked)
                      }
                      className="cursor-pointer w-5 h-5 text-purple-500 focus:ring-purple-500"
                    />
                  </div>
                )}
                {onRemove && (!showOnlyFirstImage || index === 0) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(image.id !== undefined ? image.id : index);
                    }}
                    className="absolute top-1 right-1 z-10 p-1 bg-white rounded-full shadow-md text-gray-700 transition-all duration-300 transform scale-0 group-hover:scale-100 hover:bg-red-500 hover:text-white"
                  >
                    <IoClose size={18} />
                  </button>
                )}
                <LazyLoadImage
                  src={thumbSrc}
                  alt={`Image ${index + 1}`}
                  effect="blur"
                  className={classNames(
                    'w-full h-full object-cover cursor-pointer shadow-md rounded-md transition-all ease-in-out duration-500 transform ',
                    imageStyles,
                    {
                      'scale-90': isSelected,
                    },
                  )}
                  wrapperClassName="w-full h-full"
                />

                {showOnlyFirstImage && index === 0 && safeImages.length > 1 && (
                  <span className="absolute bottom-1 right-1 text-xs bg-black bg-opacity-70 text-white rounded-full px-2 py-0.5">
                    +{safeImages.length - 1}
                  </span>
                )}
              </div>
            </PhotoView>
          );
        })}

        {/* Registrar PhotoView invisibles para el carrusel cuando solo se muestra la primera imagen */}
        {showOnlyFirstImage &&
          safeImages.slice(1).map((image, idx) => (
            <PhotoView
              key={`hidden-${image.id || idx}`}
              src={getImageSrc(image)}
            >
              <div className="hidden" />
            </PhotoView>
          ))}
      </div>
    </PhotoProvider>
  );
};

export default memo(ImageViewer);
