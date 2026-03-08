import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ThreeCircles } from 'react-loader-spinner';

const LoadingModal = ({ loading }) => {
  const [modalRoot, setModalRoot] = useState(null);

  useEffect(() => {
    setModalRoot(document.getElementById('modal-root'));
  }, []);

  if (!loading || !modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/10 p-8 shadow-2xl ring-1 ring-white/20">
        <ThreeCircles
          visible={true}
          height="80"
          width="80"
          color="#a855f7"
          ariaLabel="three-circles-loading"
        />
      </div>
    </div>,
    modalRoot,
  );
};

export default LoadingModal;
