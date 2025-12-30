import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ThreeCircles } from 'react-loader-spinner';

const LoadingModal = ({ loading }) => {
  const [modalRoot, setModalRoot] = useState(null);

  useEffect(() => {
    setModalRoot(document.getElementById('modal-root'));
  }, []);

  if (!loading || !modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 z-[9999] flex justify-center items-center">
      <div className="p-4 grid place-content-center">
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#7e3af2"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperclassName=""
        />
      </div>
    </div>,
    modalRoot,
  );
};

export default LoadingModal;
