/**
 * Modal para ver el estado de lectura de las notificaciones de una regla
 * Solo el creador de la regla puede ver esta información
 */
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Badge,
  Spinner,
  Progress,
  Table,
  Tooltip,
} from 'flowbite-react';
import {
  HiEye,
  HiEyeOff,
  HiCheckCircle,
  HiXCircle,
  HiUsers,
  HiMail,
  HiClock,
} from 'react-icons/hi';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNotifications } from '../../context/NotificationContext';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';

const RuleReadStatusModal = ({ show, onClose, rule }) => {
  const { getRuleReadStatus } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && rule) {
      loadReadStatus();
    }
  }, [show, rule]);

  const loadReadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRuleReadStatus(rule.id);
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

  const getReadStatusText = (percentage) => {
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 50) return 'Bueno';
    if (percentage > 0) return 'Regular';
    return 'Sin leer';
  };

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <Modal.Header>
        <div className="flex items-center gap-2">
          <HiEye className="w-5 h-5 text-blue-500" />
          <span>Estado de Lectura - {rule?.name}</span>
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
          <div className="space-y-6">
            {/* Resumen General */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HiUsers className="w-5 h-5 text-gray-600" />
                Resumen General
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Total Notificaciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.summary.totalNotifications}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Leídas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {data.summary.totalRead}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Sin Leer</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {data.summary.totalUnread}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Destinatarios</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {data.summary.recipientsCount}
                  </p>
                </div>
              </div>

              {/* Barra de progreso general */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Tasa de lectura global</span>
                  <span
                    className={`font-medium text-${getReadStatusColor(data.summary.readPercentage)}-600`}
                  >
                    {data.summary.readPercentage}% -{' '}
                    {getReadStatusText(data.summary.readPercentage)}
                  </span>
                </div>
                <Progress
                  progress={data.summary.readPercentage}
                  color={getReadStatusColor(data.summary.readPercentage)}
                  size="lg"
                />
              </div>
            </div>

            {/* Estado por Destinatario */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HiMail className="w-5 h-5 text-gray-600" />
                Estado por Destinatario
              </h3>

              {data.recipients.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <HiEyeOff className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    No hay notificaciones enviadas aún
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table hoverable>
                    <Table.Head>
                      <Table.HeadCell>Destinatario</Table.HeadCell>
                      <Table.HeadCell className="text-center">
                        Notificaciones
                      </Table.HeadCell>
                      <Table.HeadCell className="text-center">
                        Leídas
                      </Table.HeadCell>
                      <Table.HeadCell className="text-center">
                        Sin Leer
                      </Table.HeadCell>
                      <Table.HeadCell>Progreso</Table.HeadCell>
                      <Table.HeadCell>Última Lectura</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {data.recipients.map((recipient) => (
                        <Table.Row key={recipient.user.id} className="bg-white">
                          <Table.Cell>
                            <div className="flex items-center gap-3">
                              {recipient.user.photoUrl ? (
                                <FormattedUrlImage
                                  url={recipient.user.photoUrl}
                                  alt={`${recipient.user.firstName} ${recipient.user.lastName}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 text-sm font-medium">
                                    {recipient.user.firstName?.[0]}
                                    {recipient.user.lastName?.[0]}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {recipient.user.firstName}{' '}
                                  {recipient.user.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {recipient.user.email}
                                </p>
                              </div>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="text-center">
                            <Badge color="gray">
                              {recipient.totalNotifications}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="text-center">
                            <Badge color="green">
                              {recipient.readNotifications}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell className="text-center">
                            <Badge
                              color={
                                recipient.unreadNotifications > 0
                                  ? 'warning'
                                  : 'gray'
                              }
                            >
                              {recipient.unreadNotifications}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="w-32">
                              <Tooltip
                                content={`${recipient.readPercentage}% leído`}
                              >
                                <Progress
                                  progress={recipient.readPercentage}
                                  color={getReadStatusColor(
                                    recipient.readPercentage,
                                  )}
                                  size="sm"
                                />
                              </Tooltip>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            {recipient.lastReadAt ? (
                              <Tooltip
                                content={format(
                                  new Date(recipient.lastReadAt),
                                  "dd/MM/yyyy 'a las' HH:mm",
                                  { locale: es },
                                )}
                              >
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                  <HiCheckCircle className="w-4 h-4 text-green-500" />
                                  {formatDistanceToNow(
                                    new Date(recipient.lastReadAt),
                                    { addSuffix: true, locale: es },
                                  )}
                                </span>
                              </Tooltip>
                            ) : (
                              <span className="text-sm text-gray-400 flex items-center gap-1">
                                <HiClock className="w-4 h-4" />
                                Pendiente
                              </span>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              )}
            </div>

            {/* Leyenda */}
            <div className="text-xs text-gray-500 border-t pt-4 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                80%+ Excelente
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-yellow-500"></span>
                50-79% Bueno
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-orange-500"></span>
                1-49% Regular
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-500"></span>
                0% Sin leer
              </span>
            </div>
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default RuleReadStatusModal;
