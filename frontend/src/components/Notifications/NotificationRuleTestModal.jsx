/**
 * Modal para probar una regla de notificación
 */
import React, { useState } from 'react';
import {
  Modal,
  Button,
  Spinner,
  Table,
  Badge,
  ToggleSwitch,
} from 'flowbite-react';
import { HiPlay, HiCheck, HiExclamation } from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';
import { toast } from 'react-hot-toast';

const NotificationRuleTestModal = ({ show, onClose, rule }) => {
  const { testRunRule } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sendNotifications, setSendNotifications] = useState(false);

  const handleTest = async () => {
    if (!rule) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await testRunRule(rule.id, sendNotifications);
      setResult(data);

      if (sendNotifications && data.matchCount > 0) {
        toast.success('Notificaciones enviadas correctamente');
      }
    } catch (error) {
      toast.error('Error al ejecutar la prueba');
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setSendNotifications(false);
    onClose();
  };

  return (
    <Modal show={show} onClose={handleClose} size="xl">
      <Modal.Header>Probar Regla: {rule?.name}</Modal.Header>
      <Modal.Body>
        {!result ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <HiExclamation className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    Modo de prueba
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Puedes ejecutar la regla en modo previsualización (solo ver
                    coincidencias) o enviar las notificaciones realmente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <ToggleSwitch
                checked={sendNotifications}
                onChange={setSendNotifications}
              />
              <div>
                <p className="font-medium">Enviar notificaciones reales</p>
                <p className="text-sm text-gray-500">
                  Si está activado, se enviarán emails y notificaciones in-app a
                  los destinatarios configurados.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                color="blue"
                onClick={handleTest}
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <HiPlay className="w-5 h-5 mr-2" />
                )}
                {loading
                  ? 'Ejecutando...'
                  : sendNotifications
                    ? 'Ejecutar y Enviar'
                    : 'Previsualizar'}
              </Button>
            </div>
          </div>
        ) : result.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <HiExclamation className="w-12 h-12 mx-auto text-red-500 mb-2" />
            <h4 className="font-medium text-red-800">Error en la ejecución</h4>
            <p className="text-sm text-red-700 mt-1">{result.error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    result.matchCount > 0 ? 'bg-green-100' : 'bg-gray-200'
                  }`}
                >
                  {result.matchCount > 0 ? (
                    <HiCheck className="w-6 h-6 text-green-600" />
                  ) : (
                    <span className="text-2xl font-bold text-gray-400">0</span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">
                    {result.matchCount} coincidencia(s) encontrada(s)
                  </h4>
                  <p className="text-sm text-gray-500">
                    {result.summary?.message || result.message}
                  </p>
                </div>
              </div>

              {sendNotifications && result.deliveries && (
                <Badge
                  color={
                    result.deliveries.filter((d) => d.status === 'SENT')
                      .length === result.deliveries.length
                      ? 'success'
                      : 'warning'
                  }
                  size="lg"
                >
                  {result.deliveries.filter((d) => d.status === 'SENT').length}/
                  {result.deliveries.length} enviados
                </Badge>
              )}
            </div>

            {/* Tabla de coincidencias */}
            {result.matches && result.matches.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h5 className="font-medium">
                    Coincidencias (mostrando{' '}
                    {Math.min(result.matches.length, 20)})
                  </h5>
                </div>
                <div className="overflow-x-auto max-h-64">
                  <Table hoverable>
                    <Table.Head>
                      {result.summary?.columns?.map((col) => (
                        <Table.HeadCell key={col.key}>
                          {col.label}
                        </Table.HeadCell>
                      ))}
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {result.matches.slice(0, 20).map((match, index) => (
                        <Table.Row key={index}>
                          {result.summary?.columns?.map((col) => (
                            <Table.Cell key={col.key}>
                              {match[col.key] ?? '-'}
                            </Table.Cell>
                          ))}
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
                {result.matches.length > 20 && (
                  <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-500 border-t">
                    ... y {result.matches.length - 20} más
                  </div>
                )}
              </div>
            )}

            {/* Botón para volver a probar */}
            <div className="flex justify-center pt-4">
              <Button color="light" onClick={() => setResult(null)}>
                Volver a probar
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationRuleTestModal;
