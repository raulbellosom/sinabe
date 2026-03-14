/**
 * QrScannerModal.jsx
 * Modal con cámara para escanear códigos QR usando html5-qrcode.
 * Props:
 *   - open       : boolean – controla visibilidad
 *   - onClose    : () => void
 *   - onScan     : (decodedText: string) => void – se invoca con cada lectura exitosa
 *   - continuous  : boolean – si true, no cierra el modal tras un escaneo
 *   - title       : string – título del modal
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, SwitchCamera, Flashlight, FlashlightOff } from 'lucide-react';

const SCANNER_REGION_ID = 'qr-scanner-region';

const QrScannerModal = ({
  open,
  onClose,
  onScan,
  continuous = false,
  title = 'Escanear código QR',
}) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const mountedRef = useRef(true);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        // state 2 = SCANNING
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      // ignore cleanup errors
    }
  }, []);

  const startScanner = useCallback(
    async (facing) => {
      await stopScanner();
      if (!mountedRef.current) return;

      try {
        const scanner = new Html5Qrcode(SCANNER_REGION_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: facing },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (!mountedRef.current) return;
            onScan(decodedText);
            if (!continuous) {
              stopScanner();
              onClose();
            }
          },
          () => {
            // QR code parse error (no QR found in frame) — ignore
          },
        );
        setError(null);
        setTorchOn(false);

        // Check if torch is supported on this camera
        try {
          const track = scanner.getRunningTrackCameraCapabilities?.();
          setTorchSupported(track?.torchFeature?.()?.isSupported?.() ?? false);
        } catch {
          setTorchSupported(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(
            err?.message?.includes('NotAllowedError') ||
              err?.toString?.()?.includes('NotAllowedError')
              ? 'Permiso de cámara denegado. Habilítalo en la configuración del navegador.'
              : 'No se pudo acceder a la cámara. Verifica los permisos.',
          );
        }
      }
    },
    [onScan, onClose, continuous, stopScanner],
  );

  useEffect(() => {
    mountedRef.current = true;
    if (open) {
      // small delay to allow DOM to mount the scanner region
      const timer = setTimeout(() => startScanner(facingMode), 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFlipCamera = async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    await startScanner(newFacing);
  };

  const handleToggleTorch = async () => {
    try {
      const scanner = scannerRef.current;
      if (!scanner) return;
      const track = scanner.getRunningTrackCameraCapabilities?.();
      const torch = track?.torchFeature?.();
      if (!torch?.isSupported?.()) return;
      if (torchOn) {
        await torch.disable();
      } else {
        await torch.enable();
      }
      setTorchOn((v) => !v);
    } catch {
      // torch toggle failed — ignore
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {torchSupported && (
              <button
                onClick={handleToggleTorch}
                className={`p-2 rounded-lg transition ${
                  torchOn
                    ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={torchOn ? 'Apagar linterna' : 'Encender linterna'}
              >
                {torchOn ? <Flashlight size={18} /> : <FlashlightOff size={18} />}
              </button>
            )}
            <button
              onClick={handleFlipCamera}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Cambiar cámara"
            >
              <SwitchCamera size={18} />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scanner region */}
        <div className="relative bg-black">
          <div id={SCANNER_REGION_ID} className="w-full min-h-80" />
          {/* Overlay instruction */}
          {!error && (
            <div className="absolute bottom-3 left-0 right-0 text-center">
              <span className="inline-block bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                {continuous
                  ? 'Escaneo continuo activo'
                  : 'Centra el código QR en el recuadro'}
              </span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium
                       text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrScannerModal;
