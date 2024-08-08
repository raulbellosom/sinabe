import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import NoImageFound from '../../assets/images/NoImageFound.jpg';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';
import { useState, useRef, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import 'react-lazy-load-image-component/src/effects/blur.css';
import classNames from 'classnames';

const ImageViewer = ({ images = [], onRemove, imagesClassNames }) => {
  return (
    <PhotoProvider
      brokenElement={
        <img
          className="w-80 h-auto rounded-lg object-cover"
          src={NoImageFound}
          alt="NoImageFound"
        />
      }
      maskOpacity={0.8}
      loop={true}
      speed={() => 200}
      toolbarRender={({ onScale, scale, rotate, onRotate }) => {
        return (
          <>
            <svg
              onClick={() => onScale(scale - 1)}
              className="PhotoView-Slider__toolbarIcon"
              width="40px"
              height="40px"
              fill="#ffffff"
              viewBox="0 0 32 32"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <title>minus-round</title>
                <path d="M0 16q0 3.264 1.28 6.208t3.392 5.12 5.12 3.424 6.208 1.248 6.208-1.248 5.12-3.424 3.392-5.12 1.28-6.208-1.28-6.208-3.392-5.12-5.088-3.392-6.24-1.28q-3.264 0-6.208 1.28t-5.12 3.392-3.392 5.12-1.28 6.208zM4 16q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016-1.6 6.048-4.384 4.352-6.016 1.6-6.016-1.6-4.384-4.352-1.6-6.048zM8 16q0 0.832 0.576 1.44t1.44 0.576h12q0.8 0 1.408-0.576t0.576-1.44-0.576-1.408-1.408-0.576h-12q-0.832 0-1.44 0.576t-0.576 1.408z"></path>
              </g>
            </svg>
            <svg
              onClick={() => onScale(scale + 1)}
              className="PhotoView-Slider__toolbarIcon"
              width="40px"
              height="40px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#ffffff"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V13H8C7.44771 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11H11V8Z"
                  fill="#ffffff"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z"
                  fill="#ffffff"
                ></path>
              </g>
            </svg>
            <svg
              onClick={() => onRotate(rotate - 90)}
              className="PhotoView-Slider__toolbarIcon scale-x-[-1]"
              fill="#ffffff"
              width="40px"
              height="40px"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 214.367 214.367"
              xmlSpace="preserve"
            >
              <path
                d="M202.403,95.22c0,46.312-33.237,85.002-77.109,93.484v25.663l-69.76-40l69.76-40v23.494
	c27.176-7.87,47.109-32.964,47.109-62.642c0-35.962-29.258-65.22-65.22-65.22s-65.22,29.258-65.22,65.22
	c0,9.686,2.068,19.001,6.148,27.688l-27.154,12.754c-5.968-12.707-8.994-26.313-8.994-40.441C11.964,42.716,54.68,0,107.184,0
	S202.403,42.716,202.403,95.22z"
              />
            </svg>
            <svg
              onClick={() => onRotate(rotate + 90)}
              className="PhotoView-Slider__toolbarIcon"
              fill="#ffffff"
              width="40px"
              height="40px"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 214.367 214.367"
              xmlSpace="preserve"
            >
              <path
                d="M202.403,95.22c0,46.312-33.237,85.002-77.109,93.484v25.663l-69.76-40l69.76-40v23.494
	c27.176-7.87,47.109-32.964,47.109-62.642c0-35.962-29.258-65.22-65.22-65.22s-65.22,29.258-65.22,65.22
	c0,9.686,2.068,19.001,6.148,27.688l-27.154,12.754c-5.968-12.707-8.994-26.313-8.994-40.441C11.964,42.716,54.68,0,107.184,0
	S202.403,42.716,202.403,95.22z"
              />
            </svg>
          </>
        );
      }}
    >
      {images.map((image, index) => (
        <PhotoView
          key={index}
          src={
            image instanceof File
              ? FormattedUrlImage(image)
              : FormattedUrlImage(image.url)
          }
          index={index}
        >
          <div className="relative">
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemove(index);
                }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
              >
                <IoClose size={20} />
              </button>
            )}
            <img
              src={
                image instanceof File
                  ? FormattedUrlImage(image)
                  : FormattedUrlImage(image.thumbnail)
              }
              alt={`Image ${index + 1}`}
              className="w-full h-auto min-h-24 md:min-h-32 object-cover cursor-pointer shadow-md rounded-lg"
            />
          </div>
        </PhotoView>
      ))}
    </PhotoProvider>
  );
};

export default ImageViewer;
