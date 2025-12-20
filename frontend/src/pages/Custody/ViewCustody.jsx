import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCustodyRecord } from '../../services/custody.api';
import { Card, Table, Badge, Button, Spinner } from 'flowbite-react';
import Breadcrumb from '../../components/Breadcrum/Breadcrumb';
import {
  HiCalendar,
  HiUser,
  HiClipboardList,
  HiChevronLeft,
  HiPencilAlt,
  HiCheckCircle,
  HiXCircle,
  HiMail,
  HiQrcode,
} from 'react-icons/hi';
import { FaFileContract, FaUserTie } from 'react-icons/fa';
import { parseToLocalDate } from '../../utils/formatValues';
import ActionButtons from '../../components/ActionButtons/ActionButtons';

const ViewCustody = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: record,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['custodyRecord', id],
    queryFn: () => getCustodyRecord(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError || !record) {
    return (
      <Card className="text-center p-8">
        <HiXCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold dark:text-white">
          Error al cargar el resguardo
        </h2>
        <p className="text-gray-500 mb-6">
          El registro no existe o no tienes permisos para verlo.
        </p>
        <Button onClick={() => navigate('/custody')}>Volver al listado</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl shadow-sm">
            <FaFileContract size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              Resguardo de{' '}
              {record.receiver
                ? `${record.receiver.firstName} ${record.receiver.lastName}`
                : record.receiverName || 'Usuario'}
              <Badge
                color={record.status === 'BORRADOR' ? 'warning' : 'info'}
                size="sm"
              >
                {record.status}
              </Badge>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <HiCalendar /> Creado el {parseToLocalDate(record.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <ActionButtons
            onCancel={() => navigate('/custody')}
            labelCancel="Volver"
            extraActions={
              record.status === 'BORRADOR'
                ? [
                    {
                      label: 'Editar Borrador',
                      icon: HiPencilAlt,
                      action: () => navigate(`/custody/edit/${record.id}`),
                      color: 'yellow',
                    },
                  ]
                : []
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subjects Info */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-blue-500 overflow-hidden">
            <h3 className="text-md font-bold text-gray-500 flex items-center gap-2 uppercase tracking-tighter mb-4">
              <HiUser className="text-blue-500" /> Receptor del Equipo
            </h3>
            <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4 border border-blue-100 dark:border-blue-800 shadow-inner">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm text-blue-500 border border-blue-100 dark:border-gray-700">
                <HiUser size={24} />
              </div>
              <div>
                <p className="font-black text-gray-800 dark:text-white leading-tight">
                  {record.receiver
                    ? `${record.receiver.firstName} ${record.receiver.lastName}`
                    : record.receiverName || 'Usuario Externo'}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {record.receiver?.employeeNumber || 'ID S/N'}
                </p>
              </div>
            </div>
            <div className="space-y-3 px-1">
              <div className="flex justify-between text-sm border-b dark:border-gray-700 pb-2">
                <span className="text-gray-400 font-medium">Puesto</span>
                <span className="font-bold text-gray-700 dark:text-gray-200">
                  {record.receiver?.jobTitle || record.receiverJobTitle || '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm border-b dark:border-gray-700 pb-2">
                <span className="text-gray-400 font-medium">Departamento</span>
                <span className="font-bold text-gray-700 dark:text-gray-200">
                  {record.receiver?.department ||
                    record.receiverDepartment ||
                    '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium tracking-tight">
                  Email
                </span>
                <span className="font-bold text-blue-500 lowercase underline decoration-1 underline-offset-2">
                  {record.receiverEmail || record.receiver?.email || '—'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <h3 className="text-md font-bold text-gray-500 flex items-center gap-2 uppercase tracking-tighter mb-4">
              <FaUserTie className="text-green-500" /> Entregado Por (TI)
            </h3>
            <div className="flex items-center gap-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl mb-2 border border-green-100 dark:border-green-800 shadow-inner">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm text-green-500 border border-green-100 dark:border-gray-700">
                <FaUserTie size={22} />
              </div>
              <div>
                <p className="font-black text-gray-800 dark:text-white leading-tight">
                  {record.deliverer?.firstName} {record.deliverer?.lastName}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-widest leading-none mt-1">
                  Administrador IT
                </p>
              </div>
            </div>
          </Card>

          {record.status === 'COMPLETADO' && (
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <HiQrcode /> Verificación Pública
              </h3>
              <p className="text-xs text-indigo-100 mb-4 leading-relaxed font-medium">
                Este resguardo cuenta con un enlace público de validación para
                auditorías externas.
              </p>
              <Button
                color="light"
                size="sm"
                className="w-full font-bold shadow-lg"
                onClick={() =>
                  window.open(
                    `${window.location.origin}/custody/public/${record.publicToken}`,
                    '_blank',
                  )
                }
              >
                <HiShare className="mr-2" /> Abrir Enlace Público
              </Button>
            </Card>
          )}
        </div>

        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2 dark:text-white font-mono uppercase tracking-tight">
              <HiClipboardList className="text-blue-500" /> Detalles de Entrega
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Fecha de Emisión
                </span>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                  {parseToLocalDate(record.date)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Comentarios
                </span>
                <p className="text-sm italic text-gray-600 dark:text-gray-400 bg-yellow-50/30 dark:bg-yellow-900/10 p-2 rounded-lg border border-yellow-100/50 dark:border-yellow-800/20 min-h-[44px]">
                  {record.comments || 'Sin observaciones adicionales.'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white font-mono uppercase tracking-tight">
                <HiClipboardList className="text-purple-500" /> Equipos
                Asociados
              </h3>
              <Badge color="purple" className="px-3">
                {record.items?.length || 0} Equipos
              </Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
              <Table hoverable striped>
                <Table.Head>
                  <Table.HeadCell>Equipo / Modelo</Table.HeadCell>
                  <Table.HeadCell>Identificadores</Table.HeadCell>
                  <Table.HeadCell>Características de Entrega</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {record.items?.map((item) => (
                    <Table.Row
                      key={item.id}
                      className="bg-white dark:bg-gray-800"
                    >
                      <Table.Cell>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {item.model || item.inventory?.model?.name || 'S/M'}
                          </span>
                          <span className="text-xs text-blue-500">
                            {item.typeBrand ||
                              (item.inventory?.model?.type?.name &&
                              item.inventory?.model?.brand?.name
                                ? `${item.inventory.model.type.name} / ${item.inventory.model.brand.name}`
                                : 'S/T')}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col text-xs font-mono">
                          <span className="font-bold">
                            SN:{' '}
                            {item.serialNumber || item.inventory?.serialNumber}
                          </span>
                          <span className="text-gray-500">
                            ACT:{' '}
                            {item.assetNumber ||
                              item.inventory?.activeNumber ||
                              '—'}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <p
                          className="text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate"
                          title={item.features}
                        >
                          {item.features || 'Sin detalles extra'}
                        </p>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Card>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 !mt-8">
        <Card>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-4">
            Firma de Conformidad (Receptor)
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 h-40 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center p-4 shadow-inner">
            {record.receiverSignature ? (
              <img
                src={record.receiverSignature}
                alt="Firma Receptor"
                className="max-h-full object-contain dark:invert"
              />
            ) : (
              <div className="text-center text-gray-400">
                <HiXCircle className="mx-auto h-8 w-8 mb-1 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-tighter">
                  Sin firma registrada
                </p>
              </div>
            )}
          </div>
          {record.receiverSignature && (
            <p className="text-center text-[10px] text-green-500 font-black uppercase mt-2 flex items-center justify-center gap-1">
              <HiCheckCircle /> Firmado Digitalmente
            </p>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-4">
            Sello Digital Responsable (TI)
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 h-40 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center p-4 shadow-inner">
            {record.delivererSignature ? (
              <img
                src={record.delivererSignature}
                alt="Firma Entrega"
                className="max-h-full object-contain dark:invert"
              />
            ) : (
              <div className="text-center text-gray-400">
                <HiXCircle className="mx-auto h-8 w-8 mb-1 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-tighter">
                  Sin firma registrada
                </p>
              </div>
            )}
          </div>
          {record.delivererSignature && (
            <p className="text-center text-[10px] text-blue-500 font-black uppercase mt-2 flex items-center justify-center gap-1">
              <HiCheckCircle /> Validado por Sistemas
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ViewCustody;
