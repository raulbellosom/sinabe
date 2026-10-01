import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import SignaturePadLib from 'signature_pad';
import {
  SIGNATURE_HEIGHT,
  SIGNATURE_WIDTH,
  canvasToPngFile,
  normalizeSignatureCanvas,
  normalizeSignatureSource,
} from '../../utils/signatureImage';

// Stroke widths expressed for a 400px-wide box; they are rescaled to the real
// on-screen width so the ink looks the same at any size/orientation.
const BASE_BOX_WIDTH = 400;
const BASE_MIN_WIDTH = 0.9;
const BASE_MAX_WIDTH = 2.8;

/**
 * Signature pad with a fixed internal resolution (SIGNATURE_WIDTH x
 * SIGNATURE_HEIGHT). The canvas bitmap is never resized: only the drawing
 * transform follows the on-screen size, so rotating the tablet, opening the
 * keyboard or resizing the window never erases or shrinks the signature.
 *
 * Imperative API (via ref):
 *  - isEmpty(): boolean
 *  - clear()
 *  - loadImage(source): Promise<boolean>  (data URL, URL or File)
 *  - toDataURL(): string | null            (normalized PNG)
 *  - toFile(name?): Promise<File | null>   (normalized PNG)
 */
const SignaturePad = forwardRef(function SignaturePad(
  {
    penColor = '#111827',
    disabled = false,
    onBegin,
    onEnd,
    maxWidth = 560,
    placeholder = 'Firme aquÃ­',
    className = '',
  },
  ref,
) {
  const canvasRef = useRef(null);
  const padRef = useRef(null);
  const hasInkRef = useRef(false);
  const loadSeqRef = useRef(0);
  const onBeginRef = useRef(onBegin);
  const onEndRef = useRef(onEnd);
  const [hasInk, setHasInk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  onBeginRef.current = onBegin;
  onEndRef.current = onEnd;

  const setInk = useCallback((value) => {
    hasInkRef.current = value;
    setHasInk(value);
  }, []);

  const applyTransform = useCallback(() => {
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!canvas || !pad) return;
    const { width } = canvas.getBoundingClientRect();
    if (!width) return;
    const ratio = canvas.width / width;
    canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
    const widthFactor = width / BASE_BOX_WIDTH;
    pad.minWidth = BASE_MIN_WIDTH * widthFactor;
    pad.maxWidth = BASE_MAX_WIDTH * widthFactor;
    pad.dotSize = (pad.minWidth + pad.maxWidth) / 2;
  }, []);

  const wipeBitmap = useCallback(() => {
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!canvas) return;
    pad?.clear();
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = SIGNATURE_WIDTH;
    canvas.height = SIGNATURE_HEIGHT;

    const pad = new SignaturePadLib(canvas, {
      penColor,
      backgroundColor: 'rgba(0,0,0,0)',
      velocityFilterWeight: 0.7,
      throttle: 8,
    });
    padRef.current = pad;
    applyTransform();

    const handleBegin = () => onBeginRef.current?.();
    const handleEnd = () => {
      setInk(true);
      onEndRef.current?.();
    };
    pad.addEventListener('beginStroke', handleBegin);
    pad.addEventListener('endStroke', handleEnd);

    const observer = new ResizeObserver(() => applyTransform());
    observer.observe(canvas);
    window.addEventListener('orientationchange', applyTransform);

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', applyTransform);
      pad.removeEventListener('beginStroke', handleBegin);
      pad.removeEventListener('endStroke', handleEnd);
      pad.off();
      padRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (padRef.current) padRef.current.penColor = penColor;
  }, [penColor]);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;
    if (disabled) pad.off();
    else pad.on();
  }, [disabled]);

  useImperativeHandle(
    ref,
    () => ({
      isEmpty: () => !hasInkRef.current,
      clear: () => {
        loadSeqRef.current += 1;
        setIsLoading(false);
        wipeBitmap();
        setInk(false);
      },
      loadImage: async (source) => {
        const seq = ++loadSeqRef.current;
        if (!source) {
          wipeBitmap();
          setInk(false);
          return false;
        }
        setIsLoading(true);
        try {
          const normalized = await normalizeSignatureSource(source);
          if (seq !== loadSeqRef.current) return false; // superseded
          wipeBitmap();
          if (normalized) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(normalized, 0, 0);
            ctx.restore();
          }
          setInk(!!normalized);
          return !!normalized;
        } finally {
          if (seq === loadSeqRef.current) setIsLoading(false);
        }
      },
      toDataURL: () => {
        if (!hasInkRef.current) return null;
        const normalized = normalizeSignatureCanvas(canvasRef.current);
        return normalized ? normalized.toDataURL('image/png') : null;
      },
      toFile: async (name = 'signature.png') => {
        if (!hasInkRef.current) return null;
        const normalized = normalizeSignatureCanvas(canvasRef.current);
        return normalized ? canvasToPngFile(normalized, name) : null;
      },
    }),
    [setInk, wipeBitmap],
  );

  return (
    <div
      className={`relative w-full mx-auto select-none overflow-hidden rounded-lg bg-white ${className}`}
      style={{
        maxWidth,
        aspectRatio: `${SIGNATURE_WIDTH} / ${SIGNATURE_HEIGHT}`,
      }}
    >
      {/* Guide line + placeholder (not part of the exported image) */}
      <div className="pointer-events-none absolute left-[8%] right-[8%] bottom-[22%] border-b border-dashed border-gray-300" />
      {!hasInk && !isLoading && (
        <span className="pointer-events-none absolute inset-x-0 bottom-[8%] text-center text-[11px] uppercase tracking-widest text-gray-300 font-semibold">
          {placeholder}
        </span>
      )}
      {isLoading && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-gray-400">
          Cargando firmaâ€¦
        </span>
      )}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block h-full w-full ${
          disabled ? 'cursor-not-allowed' : 'cursor-crosshair'
        }`}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
});

export default SignaturePad;
