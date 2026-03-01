 
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

const baseToast = (message, options) => sonnerToast(message, options);

baseToast.success = (message, options) => sonnerToast.success(message, options);
baseToast.error = (message, options) => sonnerToast.error(message, options);
baseToast.loading = (message, options) => sonnerToast.loading(message, options);
baseToast.dismiss = (toastId) => sonnerToast.dismiss(toastId);
baseToast.promise = (promise, messages) =>
  sonnerToast.promise(promise, messages);
baseToast.custom = (render, options) => sonnerToast.custom(render, options);

export const toast = baseToast;

export const Toaster = ({
  position = 'bottom-right',
  richColors = true,
  ...props
}) => <SonnerToaster position={position} richColors={richColors} {...props} />;

export default toast;
