/**
 * Modal para ver el estado de lectura de una notificación específica
 * Solo visible para el creador de la regla que generó la notificación
 */
import React, { useState, useEffect } from 'react';
import { Modal, Badge, Spinner, Progress, Tooltip } from 'flowbite-react';
import {
  HiEye,
  HiEyeOff,
  HiCheckCircle,
  HiClock,
  HiUsers,
  HiXCircle,
} from 'react-icons/hi';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNotifications } from '../../context/NotificationContext';
import ImageViewer2 from '../ImageViewer/ImageViewer2';

const NotificationReadStatusModal = ({ show, onClose, notification }) => {
  const { getNotificationReadStatus } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && notification) {
      loadReadStatus();
    }
  }, [show, notification]);

  const loadReadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotificationReadStatus(notification.id);
      setData(result);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Error al cargar el estado de lectura',
      );
    } finally {
      setLoading(false);
    }
  };

  const getReadStatusColor = (percentage) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 50) return 'yellow';
    if (percentage > 0) return 'orange';
    return 'red';
  };

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <Modal.Header>
        <div className="flex items-center gap-2">
          <HiEye className="w-5 h-5 text-blue-500" />
          <span>¿Quién ha visto esta notificación?</span>
        </div>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <HiXCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Título de la notificación */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Notificación</p>
              <p className="font-medium text-gray-900">{data.title}</p>
              <p className="text-xs text-gray-400 mt-1">
                Enviada{' '}
                {formatDistanceToNow(new Date(data.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                <HiUsers className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                <p className="text-2xl font-bold text-blue-700">
                  {data.summary.totalRecipients}
                </p>
                <p className="text-xs text-blue-600">Destinatarios</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                <HiCheckCircle className="w-6 h-6 mx-auto text-green-500 mb-1" />
                <p className="text-2xl font-bold text-green-700">
                  {data.summary.totalRead}
                </p>
                <p className="text-xs text-green-600">Leídas</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
                <HiClock className="w-6 h-6 mx-auto text-orange-500 mb-1" />
                <p className="text-2xl font-bold text-orange-700">
                  {data.summary.totalUnread}
                </p>
                <p className="text-xs text-orange-600">Pendientes</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Tasa de lectura</span>
                <span
                  className={`font-semibold text-${getReadStatusColor(data.summary.readPercentage)}-600`}
                >
                  {data.summary.readPercentage}%
                </span>
              </div>
              <Progress
                progress={data.summary.readPercentage}
                color={getReadStatusColor(data.summary.readPercentage)}
                size="lg"
              />
            </div>

            {/* Lista de destinatarios */}
            {data.recipients.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Destinatarios
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.recipients.map((recipient) => (
                    <div
                      key={recipient.notificationId}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        recipient.isRead
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {recipient.user.photoUrl ? (
                          <ImageViewer2
                            images={[recipient.user.photoUrl]}
                            alt={`${recipient.user.firstName} ${recipient.user.lastName}`}
                            containerClassNames="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {recipient.user.firstName?.[0]}
                              {recipient.user.lastName?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {recipient.user.firstName} {recipient.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {recipient.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {recipient.isRead ? (
                          <Tooltip
                            content={format(
                              new Date(recipient.readAt),
                              "dd/MM/yyyy 'a las' HH:mm",
                              { locale: es },
                            )}
                          >
                            <div className="flex items-center gap-1 text-green-600">
                              <HiCheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Leída</span>
                            </div>
                          </Tooltip>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <HiEyeOff className="w-5 h-5" />
                            <span className="text-sm">Pendiente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default NotificationReadStatusModal;
