/**
 * Componente para gestionar suscripciones a Push Notifications
 * Permite activar/desactivar notificaciones y enviar pruebas
 */
import React, { useState } from 'react';
import {
  usePushNotifications,
  PERMISSION_STATUS,
} from '../../hooks/usePushNotifications';
import {
  HiBell,
  HiBellSlash,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';

const PushNotificationSettings = ({
  showTestButton = true,
  compact = false,
}) => {
  const {
    isSupported,
    isNative,
    permission,
    isSubscribed,
    subscriptions,
    loading,
    error,
    subscribe,
    unsubscribe,
    testNotification,
    canSubscribe,
    needsPermission,
    permissionDenied,
  } = usePushNotifications();

  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (err) {
      // Error ya manejado por el hook
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await testNotification();
      setTestResult({ success: true, message: result.message });
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  // No soportado
  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500">
          <HiBellSlash className="w-5 h-5" />
          <span>
            Las notificaciones push no están soportadas en este dispositivo
          </span>
        </div>
      </div>
    );
  }

  // Permiso denegado
  if (permissionDenied) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <HiOutlineExclamationCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Permisos denegados
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Has bloqueado las notificaciones para este sitio. Para
              habilitarlas, haz clic en el icono de candado en la barra de
              direcciones y permite las notificaciones.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Vista compacta
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <HiBell className="w-5 h-5 text-primary-600" />
          ) : (
            <HiBellSlash className="w-5 h-5 text-gray-400" />
          )}
          <span className="text-sm">
            {isSubscribed
              ? 'Notificaciones activas'
              : 'Notificaciones desactivadas'}
          </span>
        </div>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isSubscribed ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSubscribed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  }

  // Vista completa
  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <HiBell className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <HiBellSlash className="w-6 h-6 text-gray-500" />
            </div>
          )}
          <div>
            <p className="font-medium">
              {isSubscribed
                ? 'Notificaciones Activas'
                : 'Notificaciones Desactivadas'}
            </p>
            <p className="text-sm text-gray-500">
              {isNative ? 'Dispositivo móvil' : 'Navegador web'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading || !canSubscribe}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isSubscribed
              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          } ${loading || !canSubscribe ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Procesando...
            </span>
          ) : isSubscribed ? (
            'Desactivar'
          ) : (
            'Activar'
          )}
        </button>
      </div>

      {/* Solicitar permiso */}
      {needsPermission && !isSubscribed && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Al activar las notificaciones, tu navegador te pedirá permiso para
            mostrar notificaciones.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Dispositivos suscritos */}
      {subscriptions.length > 0 && (
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
            <p className="text-sm font-medium">Dispositivos registrados</p>
          </div>
          <ul className="divide-y dark:divide-gray-700">
            {subscriptions.map((sub) => (
              <li
                key={sub.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${sub.enabled ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
                  <span className="text-sm capitalize">
                    {sub.deviceType || 'web'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(sub.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón de prueba */}
      {showTestButton && isSubscribed && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleTestNotification}
            disabled={testLoading}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {testLoading ? 'Enviando...' : 'Enviar notificación de prueba'}
          </button>
          {testResult && (
            <span
              className={`text-sm flex items-center gap-1 ${
                testResult.success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {testResult.success ? (
                <HiOutlineCheckCircle className="w-4 h-4" />
              ) : (
                <HiOutlineExclamationCircle className="w-4 h-4" />
              )}
              {testResult.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PushNotificationSettings;
