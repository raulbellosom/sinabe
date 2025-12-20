import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  getCustodyRecordByToken,
  submitPublicSignature,
} from '../../services/custody.api';
import { Card, Table, Spinner, Alert, Button, Badge } from 'flowbite-react';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'react-hot-toast';
import {
  HiExclamation,
  HiCheckCircle,
  HiCalendar,
  HiUser,
  HiOfficeBuilding,
  HiInformationCircle,
  HiPencilAlt,
  HiX,
} from 'react-icons/hi';
import sinabeIcon from '../../assets/logo/sinabe_icon.png';
import gapLogo from '../../assets/logo/gap.png';

const PublicCustodyView = () => {
  const { token } = useParams();
  const sigPad = useRef(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignedSuccessfully, setIsSignedSuccessfully] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const data = await getCustodyRecordByToken(token);
        setRecord(data);
        if (data.receiver) {
          document.title = `SINABE - Resguardo de ${data.receiver.firstName} ${data.receiver.lastName}`;
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el resguardo');
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();

    return () => {
      document.title = 'SINABE - Sistema de Inventarios y Bienes';
    };
  }, [token]);

  const handleSubmitSignature = async () => {
    if (!sigPad.current || sigPad.current.isEmpty()) {
      toast.error('Por favor, dibuja tu firma antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const signatureBase64 = sigPad.current.getCanvas().toDataURL('image/png');
      const data = await submitPublicSignature(token, signatureBase64);
      setRecord(data.custodyRecord);
      setIsSignedSuccessfully(true);
      toast.success('Firma registrada exitosamente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar la firma');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
          Cargando resguardo...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Alert color="failure" icon={HiExclamation}>
          <span className="font-medium">¡Atención!</span> {error}
        </Alert>
        <div className="mt-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={sinabeIcon}
              alt="SINABE Icon"
              className="h-10 w-auto opacity-50 grayscale"
            />
            <span className="text-xl font-black tracking-tighter text-gray-400">
              SINABE
            </span>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Sistema de Inventarios y Bienes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header / Branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img
              src={gapLogo}
              alt="GAP Logo"
              className="h-12 w-auto object-contain"
            />
            <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <img
                src={sinabeIcon}
                alt="SINABE Icon"
                className="h-12 w-auto object-contain"
              />
              <span className="text-2xl font-black tracking-tighter text-[#5c2d91]">
                SINABE
              </span>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Resguardo de {record.receiver.firstName}{' '}
              {record.receiver.lastName}
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px]">
              Verificación Oficial de Entrega de Equipo Tecnológico
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Status Alert */}
          <Alert color="success" icon={HiCheckCircle}>
            Este es un documento verificado y válido emitido por el Departamento
            de TI.
          </Alert>

          {/* General Info */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <HiCalendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                      Fecha de Emisión
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <HiUser className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                      Empleado Receptor
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.receiver.firstName} {record.receiver.lastName}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      #{record.receiver.employeeNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <HiOfficeBuilding className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                      Departamento / Puesto
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.receiver.department}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {record.receiver.jobTitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Equipment Table */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Equipos Amparados
            </h3>
            <div className="overflow-x-auto">
              <Table striped>
                <Table.Head>
                  <Table.HeadCell>Tipo / Marca</Table.HeadCell>
                  <Table.HeadCell>Modelo</Table.HeadCell>
                  <Table.HeadCell>S/N</Table.HeadCell>
                  <Table.HeadCell>Activo</Table.HeadCell>
                  <Table.HeadCell>Características</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {record.items?.map((item) => (
                    <Table.Row key={item.id}>
                      <Table.Cell className="font-medium">
                        {item.typeBrand ||
                          (item.inventory?.model?.type?.name &&
                          item.inventory?.model?.brand?.name
                            ? `${item.inventory.model.type.name} / ${item.inventory.model.brand.name}`
                            : 'S/T')}
                      </Table.Cell>
                      <Table.Cell>
                        {item.model || item.inventory?.model?.name || 'S/M'}
                      </Table.Cell>
                      <Table.Cell className="font-mono text-xs">
                        {item.serialNumber ||
                          item.inventory?.serialNumber ||
                          'N/A'}
                      </Table.Cell>
                      <Table.Cell className="font-mono text-xs">
                        {item.assetNumber ||
                          item.inventory?.activeNumber ||
                          'N/A'}
                      </Table.Cell>
                      <Table.Cell
                        className="text-xs italic text-gray-500 max-w-[150px]"
                        title={item.features}
                      >
                        {item.features || '—'}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Card>

          {/* Comments */}
          {record.comments && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <HiInformationCircle className="text-blue-600" /> Comentarios
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap">
                {record.comments}
              </p>
            </Card>
          )}

          {/* Signatures Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deliverer Signature (Read Only) */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <HiUser className="text-green-500" /> Entregado por (TI)
              </h3>
              <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl min-h-[160px] items-center">
                {record.delivererSignature ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={record.delivererSignature}
                      alt="Firma del entregador"
                      className="max-h-32 object-contain"
                    />
                    <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {record.deliverer?.firstName} {record.deliverer?.lastName}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    Firma de entrega no registrada.
                  </p>
                )}
              </div>
              <p className="mt-2 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                Responsable de TI
              </p>
            </Card>

            {/* Receiver Signature (Interactive if draft) */}
            <Card
              className={
                record.status === 'BORRADOR'
                  ? 'border-2 border-blue-500 shadow-lg'
                  : ''
              }
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                Recibido por (Usuario)
                {record.status === 'BORRADOR' && (
                  <Badge color="warning">Pendiente</Badge>
                )}
              </h3>

              {record.status === 'BORRADOR' ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900 overflow-hidden shadow-inner relative">
                    <SignatureCanvas
                      ref={sigPad}
                      penColor="black"
                      canvasProps={{
                        className: 'w-full h-40 cursor-crosshair',
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => sigPad.current.clear()}
                      >
                        <HiX className="mr-1 h-3 w-3" /> Limpiar
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3 pt-2">
                    <Button
                      size="md"
                      color="info"
                      className="w-full font-bold shadow-lg hover:scale-[1.02] transition-all"
                      onClick={handleSubmitSignature}
                      isProcessing={isSubmitting}
                    >
                      <HiCheckCircle className="mr-2 h-5 w-5" /> Firmar y
                      Finalizar
                    </Button>
                    <p className="text-[9px] text-gray-400 text-center uppercase tracking-tighter leading-tight font-medium">
                      Al firmar, confirmas que has recibido el equipo en las
                      condiciones descritas.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {isSignedSuccessfully && (
                    <Alert
                      color="success"
                      icon={HiCheckCircle}
                      className="py-2"
                    >
                      <span className="text-xs font-bold">
                        ¡Firma registrada con éxito!
                      </span>
                    </Alert>
                  )}
                  <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl min-h-[160px] items-center">
                    {record.receiverSignature ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={record.receiverSignature}
                          alt="Firma del receptor"
                          className="max-h-32 object-contain"
                        />
                        <p className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                          {record.receiver?.firstName}{' '}
                          {record.receiver?.lastName}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-sm">
                        Sin firma de recepción.
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                    Firma del Empleado
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-xs border-t border-gray-200 dark:border-gray-700 pt-6">
          <p>
            © {new Date().getFullYear()} SINABE - Sistema de Inventarios y
            Bienes
          </p>
          <p className="mt-1 font-medium">Grupo Aeroportuario del Pacífico</p>
        </div>
      </div>
    </div>
  );
};

export default PublicCustodyView;
