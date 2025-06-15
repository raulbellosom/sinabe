// Un estilo base para todos los iconos de la barra de herramientas
const iconClassName = 'PhotoView-Slider__toolbarIcon cursor-pointer';

export const ZoomOutIcon = ({ onClick }) => (
  <svg
    onClick={onClick}
    className={iconClassName}
    width="40px"
    height="40px"
    fill="#ffffff"
    viewBox="0 0 32 32"
  >
    {/* path de "minus-round" */}
    <path d="M0 16q0 3.264 1.28 6.208t3.392 5.12 5.12 3.424 6.208 1.248 6.208-1.248 5.12-3.424 3.392-5.12 1.28-6.208-1.28-6.208-3.392-5.12-5.088-3.392-6.24-1.28q-3.264 0-6.208 1.28t-5.12 3.392-3.392 5.12-1.28 6.208zM4 16q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016-1.6 6.048-4.384 4.352-6.016 1.6-6.016-1.6-4.384-4.352-1.6-6.048zM8 16q0 0.832 0.576 1.44t1.44 0.576h12q0.8 0 1.408-0.576t0.576-1.44-0.576-1.408-1.408-0.576h-12q-0.832 0-1.44 0.576t-0.576 1.408z" />
  </svg>
);

export const ZoomInIcon = ({ onClick }) => (
  <svg
    onClick={onClick}
    className={iconClassName}
    width="40px"
    height="40px"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffffff"
  >
    {/* path de "plus-round" */}
    <path
      d="M11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V13H8C7.44771 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11H11V8Z"
      fill="#ffffff"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z"
      fill="#ffffff"
    />
  </svg>
);

const rotateIconPath =
  'M202.403,95.22c0,46.312-33.237,85.002-77.109,93.484v25.663l-69.76-40l69.76-40v23.494c27.176-7.87,47.109-32.964,47.109-62.642c0-35.962-29.258-65.22-65.22-65.22s-65.22,29.258-65.22,65.22c0,9.686,2.068,19.001,6.148,27.688l-27.154,12.754c-5.968-12.707-8.994-26.313-8.994-40.441C11.964,42.716,54.68,0,107.184,0S202.403,42.716,202.403,95.22z';

export const RotateLeftIcon = ({ onClick }) => (
  <svg
    onClick={onClick}
    className={`${iconClassName} scale-x-[-1]`}
    fill="#ffffff"
    width="40px"
    height="40px"
    viewBox="0 0 214.367 214.367"
  >
    <path d={rotateIconPath} />
  </svg>
);

export const RotateRightIcon = ({ onClick }) => (
  <svg
    onClick={onClick}
    className={iconClassName}
    fill="#ffffff"
    width="40px"
    height="40px"
    viewBox="0 0 214.367 214.367"
  >
    <path d={rotateIconPath} />
  </svg>
);
