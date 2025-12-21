import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import SignatureCanvas from 'react-signature-canvas';
import {
  createCustodyRecord,
  getCustodyRecord,
  updateCustodyRecord,
} from '../../services/custody.api';
import { searchUsers } from '../../services/searchUsers.api';
import { searchInventories } from '../../services/searchInventories.api';
import { updateUser, API_URL } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import {
  Button,
  Label,
  Card,
  Checkbox,
  Table,
  Modal,
  Badge,
  Breadcrumb,
} from 'flowbite-react';
import { HiPencilAlt, HiTrash } from 'react-icons/hi';
import AutoCompleteInput from '../../components/Inputs/AutoCompleteInput';
import TextInput from '../../components/Inputs/TextInput';
import TextArea from '../../components/Inputs/TextArea';
import DateInput from '../../components/Inputs/DateInput';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import {
  HiLockClosed,
  HiLockOpen,
  HiRefresh,
  HiCheckCircle,
  HiShare,
  HiChevronRight,
  HiOutlineSave,
  HiX,
} from 'react-icons/hi';
import { FaFileContract, FaUserTie } from 'react-icons/fa';
import { IoMdUnlock, IoMdLock } from 'react-icons/io';
import { QRCodeSVG } from 'qrcode.react';
import LoadingModal from '../../components/loadingModal/LoadingModal';

const CreateCustody = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const queryClient = useQueryClient();
  const { user, updateSignature } = useAuthContext();
  const receiverSigPad = useRef({});
  const delivererSigPad = useRef({});

  const [selectedInventories, setSelectedInventories] = useState([]);
  const [isNewUserMode, setIsNewUserMode] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [allInventories, setAllInventories] = useState([]);
  const [inventorySearchKey, setInventorySearchKey] = useState(0);
  const [originalDeliverer, setOriginalDeliverer] = useState(null);

  // Modal state for missing user data
  const [isMissingDataModalOpen, setIsMissingDataModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);

  // Signature update state
  const [isSignatureUpdateModalOpen, setIsSignatureUpdateModalOpen] =
    useState(false);
  const [pendingCustodyPayload, setPendingCustodyPayload] = useState(null);
  const [isDelivererSignatureChanged, setIsDelivererSignatureChanged] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  // Success/Share Modal
  const [createdRecordData, setCreatedRecordData] = useState(null);

  // Loading states
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isInventoriesLoading, setIsInventoriesLoading] = useState(false);

  // Signature control states
  const [isReceiverLocked, setIsReceiverLocked] = useState(true);
  const [isDelivererLocked, setIsDelivererLocked] = useState(true);
  const [initialDelivererSignature, setInitialDelivererSignature] =
    useState(null);

  // Canvas dimensions for desync fix
  const [canvasWidth, setCanvasWidth] = useState(350);
  const receiverContainerRef = useRef(null);
  const delivererContainerRef = useRef(null);

  // Resize handler to fix desync
  useEffect(() => {
    const handleResize = () => {
      if (receiverContainerRef.current) {
        setCanvasWidth(receiverContainerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load saved signature
  useEffect(() => {
    const loadSignature = async () => {
      // Solo cargar si NO estamos en modo edición o si el registro no tiene un entregador aún
      if (!isEditMode && user?.signature?.url && delivererSigPad.current) {
        try {
          const response = await fetch(`${API_URL}/${user.signature.url}`);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result;
            setInitialDelivererSignature(dataUrl);
            delivererSigPad.current.fromDataURL(dataUrl, {
              ratio: 1,
              width: 350,
              height: 150,
            });
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.error('Error loading signature', e);
        }
      }
    };
    loadSignature();
  }, [user]);

  const handleReestablishDelivererSignature = () => {
    if (initialDelivererSignature) {
      delivererSigPad.current.clear();
      delivererSigPad.current.fromDataURL(initialDelivererSignature, {
        ratio: 1,
        width: 350,
        height: 150,
      });
      setIsDelivererSignatureChanged(false);
    }
  };

  // Debounce search functions helper (simplified for use here)
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSearchUsers = useCallback(
    debounce(async (term) => {
      setIsUsersLoading(true);
      try {
        const res = await searchUsers({ searchTerm: term, pageSize: 20 });
        setAllUsers(res.data || []);
      } catch (error) {
        console.error('Error searching users', error);
      } finally {
        setIsUsersLoading(false);
      }
    }, 500),
    [],
  );

  const handleSearchInventories = useCallback(
    debounce(async (term) => {
      setIsInventoriesLoading(true);
      try {
        const res = await searchInventories({
          searchTerm: term,
          pageSize: 20,
          status: 'ALTA',
        });
        setAllInventories(res.data || []);
      } catch (error) {
        console.error('Error searching inventories', error);
      } finally {
        setIsInventoriesLoading(false);
      }
    }, 500),
    [],
  );

  const formik = useFormik({
    initialValues: {
      date: new Date().toLocaleDateString('en-CA'),
      receiver: {
        userId: null,
        isNewInactiveUser: false,
        firstName: '',
        lastName: '',
        userName: '',
        email: '',
        employeeNumber: '',
        jobTitle: '',
        department: '',
      },
      delivererUserId: 'current-user-id',
      comments: '',
      items: [],
    },
    validationSchema: Yup.object({
      date: Yup.date().required('Fecha requerida'),
      receiver: Yup.object().shape({
        isNewInactiveUser: Yup.boolean(),
        userId: Yup.string()
          .nullable()
          .when('isNewInactiveUser', {
            is: false,
            then: (schema) => schema.required('Seleccione un usuario receptor'),
          }),
        firstName: Yup.string().when('isNewInactiveUser', {
          is: true,
          then: (schema) => schema.required('Nombre requerido'),
        }),
        lastName: Yup.string().when('isNewInactiveUser', {
          is: true,
          then: (schema) => schema.required('Apellido requerido'),
        }),
        userName: Yup.string().when('isNewInactiveUser', {
          is: true,
          then: (schema) => schema.required('Usuario requerido'),
        }),
        email: Yup.string()
          .email('Email inválido')
          .when('isNewInactiveUser', {
            is: true,
            then: (schema) => schema.required('Email requerido'),
          }),
      }),
      items: Yup.array().min(1, 'Debe agregar al menos un equipo'),
    }),
    onSubmit: async (values) => {
      if (receiverSigPad.current.isEmpty()) {
        toast.error('La firma del receptor es obligatoria');
        return;
      }
      if (delivererSigPad.current.isEmpty()) {
        toast.error('La firma de entrega es obligatoria');
        return;
      }

      const receiverSignature = receiverSigPad.current
        .getCanvas()
        .toDataURL('image/png');
      const delivererSignature = delivererSigPad.current
        .getCanvas()
        .toDataURL('image/png');

      const payload = {
        ...values,
        items: selectedInventories.map((inv) => ({
          inventoryId: inv.id,
          typeBrand: `${inv.model?.type?.name || ''} / ${inv.model?.brand?.name || ''}`,
          model: inv.model?.name || '',
          serialNumber: inv.serialNumber || '',
          assetNumber: inv.activeNumber || '',
          invoiceNumber: inv.invoice?.code || '',
          features: inv.features || '',
        })),
        signatures: {
          receiver: receiverSignature,
          deliverer: delivererSignature,
        },
        delivererUserId:
          isEditMode && originalDeliverer ? originalDeliverer.id : user?.id,
        status: 'COMPLETADO',
      };

      if (isDelivererSignatureChanged) {
        setPendingCustodyPayload(payload);
        setIsSignatureUpdateModalOpen(true);
      } else {
        await submitCustody(payload, 'COMPLETADO');
      }
    },
  });

  // Load existing data in edit mode
  useEffect(() => {
    if (isEditMode) {
      const loadRecord = async () => {
        try {
          const record = await getCustodyRecord(id);
          setOriginalDeliverer(record.deliverer);
          formik.setValues({
            date: record.date.split('T')[0],
            receiver: {
              userId: record.receiverId,
              isNewInactiveUser: false,
              name: `${record.receiver.firstName} ${record.receiver.lastName}`,
              email: record.receiver.email,
              employeeNumber: record.receiver.employeeNumber,
              jobTitle: record.receiver.jobTitle,
              department: record.receiver.department,
            },
            comments: record.comments || '',
          });

          if (record.items) {
            setSelectedInventories(
              record.items.map((item) => ({
                ...item.inventory,
                id: item.inventoryId,
                features: item.features || item.inventory?.comments || '',
              })),
            );
          }

          // Load signatures
          if (record.receiverSignature) {
            receiverSigPad.current.fromDataURL(record.receiverSignature);
          }
          if (record.delivererSignature) {
            delivererSigPad.current.fromDataURL(record.delivererSignature);
          }
        } catch (error) {
          toast.error('Error al cargar el resguardo para editar');
          navigate('/custody');
        }
      };
      loadRecord();
    }
  }, [id, isEditMode]);

  const handleSaveDraft = async () => {
    const values = formik.values;

    const receiverSignature = !receiverSigPad.current.isEmpty()
      ? receiverSigPad.current.getCanvas().toDataURL('image/png')
      : null;
    const delivererSignature = !delivererSigPad.current.isEmpty()
      ? delivererSigPad.current.getCanvas().toDataURL('image/png')
      : null;

    const payload = {
      ...values,
      items: selectedInventories.map((inv) => ({
        inventoryId: inv.id,
        typeBrand: `${inv.model?.type?.name || ''} / ${inv.model?.brand?.name || ''}`,
        model: inv.model?.name || '',
        serialNumber: inv.serialNumber || '',
        assetNumber: inv.activeNumber || '',
        invoiceNumber: inv.invoice?.code || '',
        features: inv.features || '',
      })),
      signatures: {
        receiver: receiverSignature,
        deliverer: delivererSignature,
      },
      delivererUserId:
        isEditMode && originalDeliverer ? originalDeliverer.id : user?.id,
      status: 'BORRADOR',
    };

    if (isDelivererSignatureChanged) {
      setPendingCustodyPayload(payload);
      setIsSignatureUpdateModalOpen(true);
    } else {
      try {
        await submitCustody(payload, 'BORRADOR');
      } finally {
        setIsDrafting(false);
      }
    }
  };

  const submitCustody = async (payload, status = 'COMPLETADO') => {
    const finalStatus = payload.status || status;
    setIsSubmitting(true);
    try {
      let res;
      if (isEditMode) {
        res = await updateCustodyRecord(id, {
          ...payload,
          status: finalStatus,
        });
      } else {
        res = await createCustodyRecord({ ...payload, status: finalStatus });
      }

      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const token =
        res.custodyRecord.publicToken ||
        res.custodyRecord.publicLink?.split('/').pop();
      const fixedLink = `${baseUrl}/custody/public/${token}`;

      setCreatedRecordData({
        ...res.custodyRecord,
        publicLink: fixedLink,
      });

      // Invalidate query to refresh the list table
      queryClient.invalidateQueries(['custody-records']);
      toast.success(
        finalStatus === 'BORRADOR'
          ? 'Borrador guardado exitosamente'
          : 'Resguardo creado exitosamente',
      );

      navigate('/custody');
    } catch (error) {
      toast.error(
        'Error al procesar resguardo: ' +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSignatureAndSubmit = async () => {
    if (isSubmitting) return;
    setIsSignatureUpdateModalOpen(false);
    setIsSubmitting(true);
    try {
      const dataUrl = delivererSigPad.current
        .getCanvas()
        .toDataURL('image/png');
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const fileToUpload = new File([blob], 'signature.png', {
        type: 'image/png',
      });

      await updateSignature(fileToUpload);
      toast.success('Firma actualizada en perfil');
      setIsDelivererSignatureChanged(false);
      await submitCustody(pendingCustodyPayload);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar firma');
      setIsSubmitting(false);
    }
  };

  const handleContinueWithoutSaving = async () => {
    if (isSubmitting) return;
    setIsSignatureUpdateModalOpen(false);
    setIsDelivererSignatureChanged(false);
    await submitCustody(pendingCustodyPayload);
  };

  const handleSelectUser = (user) => {
    if (!user.employeeNumber || !user.jobTitle || !user.department) {
      setUserToUpdate(user);
      setIsMissingDataModalOpen(true);
      return;
    }
    setUserDataInForm(user);
  };

  const setUserDataInForm = (user) => {
    formik.setFieldValue('receiver.userId', user.id);
    formik.setFieldValue('receiver.name', `${user.firstName} ${user.lastName}`);
    formik.setFieldValue('receiver.email', user.email);
    formik.setFieldValue('receiver.employeeNumber', user.employeeNumber || '');
    formik.setFieldValue('receiver.jobTitle', user.jobTitle || '');
    formik.setFieldValue('receiver.department', user.department || '');
    formik.setFieldValue('receiver.isNewInactiveUser', false);
  };

  const handleAddInventory = (inv) => {
    if (selectedInventories.find((i) => i.id === inv.id)) return;
    setSelectedInventories([
      ...selectedInventories,
      { ...inv, features: inv.comments || '' },
    ]);
  };

  const handleRemoveInventory = (id) => {
    setSelectedInventories(selectedInventories.filter((i) => i.id !== id));
  };

  const handleFeatureChange = (id, val) => {
    setSelectedInventories(
      selectedInventories.map((i) =>
        i.id === id ? { ...i, features: val } : i,
      ),
    );
  };

  // Sync selectedInventories with formik items for validation
  useEffect(() => {
    formik.setFieldValue('items', selectedInventories);
  }, [selectedInventories]);

  const updateFormik = useFormik({
    initialValues: {
      employeeNumber: '',
      jobTitle: '',
      department: '',
    },
    validationSchema: Yup.object({
      employeeNumber: Yup.string().required('Requerido'),
      jobTitle: Yup.string().required('Requerido'),
      department: Yup.string().required('Requerido'),
    }),
    onSubmit: async (values) => {
      if (!userToUpdate) return;
      try {
        const updatedUser = await updateUser({
          ...userToUpdate,
          role: userToUpdate.role?.id || userToUpdate.roleId,
          ...values,
        });

        toast.success('Datos de usuario actualizados');
        setUserDataInForm(updatedUser);
        setIsMissingDataModalOpen(false);
        setUserToUpdate(null);
      } catch (error) {
        console.error(error);
        toast.error('Error al actualizar usuario');
      }
    },
  });

  useEffect(() => {
    if (userToUpdate) {
      updateFormik.setValues({
        employeeNumber: userToUpdate.employeeNumber || '',
        jobTitle: userToUpdate.jobTitle || '',
        department: userToUpdate.department || '',
      });
    }
  }, [userToUpdate]);

  // Custom form wrapper for User AutoComplete
  const userFormWrapper = {
    ...formik,
    setFieldValue: (field, value) => {
      formik.setFieldValue(field, value);
      if (field === 'receiver.userId') {
        const user = allUsers.find((u) => u.id === value);
        if (user) handleSelectUser(user);
      }
    },
    setFieldTouched: formik.setFieldTouched,
  };

  // Custom form wrapper for Inventory AutoComplete
  const inventoryFormWrapper = {
    touched: {},
    errors: {},
    setFieldValue: (field, value) => {
      const inv = allInventories.find((i) => i.id === value);
      if (inv) {
        handleAddInventory(inv);
        setInventorySearchKey((prev) => prev + 1);
      }
    },
    setFieldTouched: () => {},
  };

  return (
    <div className="space-y-6">
      <LoadingModal loading={isSubmitting || isDrafting} />
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <FaFileContract size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEditMode ? 'Actualizar Resguardo' : 'Nuevo Resguardo'}
          </h1>
        </div>

        <div className="flex gap-2">
          <ActionButtons
            onSave={formik.handleSubmit}
            labelSave="Finalizar Resguardo"
            iconSave={HiCheckCircle}
            disabledSave={isSubmitting || isDrafting}
            onCancel={() => navigate('/custody')}
            extraActions={[
              {
                label: 'Guardar Borrador',
                icon: HiOutlineSave,
                action: handleSaveDraft,
                color: 'yellow',
                disabled: isSubmitting || isDrafting,
              },
            ]}
          />
        </div>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Receiver / Deliverer */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2 dark:text-white">
                <HiCheckCircle className="text-green-500" /> Sujetos del
                Resguardo
              </h3>
              <div className="space-y-4">
                <div>
                  <Label
                    value="Responsable de TI (Entrega)"
                    className="text-xs uppercase tracking-wider text-gray-500"
                  />
                  <p className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                    {isEditMode && originalDeliverer
                      ? `${originalDeliverer.firstName} ${originalDeliverer.lastName}`
                      : `${user?.firstName} ${user?.lastName}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <Checkbox
                    id="isNewUser"
                    checked={isNewUserMode}
                    onChange={(e) => {
                      setIsNewUserMode(e.target.checked);
                      formik.setFieldValue(
                        'receiver.isNewInactiveUser',
                        e.target.checked,
                      );
                      if (e.target.checked)
                        formik.setFieldValue('receiver.userId', null);
                    }}
                  />
                  <Label htmlFor="isNewUser" className="text-sm font-medium">
                    Registrar nuevo receptor (externo/inactivo)
                  </Label>
                </div>

                {!isNewUserMode ? (
                  <AutoCompleteInput
                    field={{
                      name: 'receiver.userId',
                      value: formik.values.receiver.userId,
                    }}
                    form={userFormWrapper}
                    options={allUsers.map((u) => ({
                      label: `${u.firstName} ${u.lastName} (${
                        u.email || u.employeeNumber
                      })`,
                      value: u.id,
                      searchTerms: `${u.firstName} ${u.lastName} ${u.email} ${u.employeeNumber}`,
                    }))}
                    onSearch={handleSearchUsers}
                    isLoading={isUsersLoading}
                    onFocusSearch={true}
                    placeholder="Buscar por nombre, correo o ID..."
                    label="Receptor del Equipo"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                    <TextInput
                      field={formik.getFieldProps('receiver.firstName')}
                      form={formik}
                      label="Nombre"
                      sizing="sm"
                    />
                    <TextInput
                      field={formik.getFieldProps('receiver.lastName')}
                      form={formik}
                      label="Apellido"
                      sizing="sm"
                    />
                    <TextInput
                      field={formik.getFieldProps('receiver.email')}
                      form={formik}
                      label="Email"
                      sizing="sm"
                    />
                    <TextInput
                      field={formik.getFieldProps('receiver.employeeNumber')}
                      form={formik}
                      label="ID/Empleado"
                      sizing="sm"
                    />
                  </div>
                )}

                {formik.values.receiver?.name && !isNewUserMode && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg animate-fadeIn">
                    <p className="font-bold text-blue-700 dark:text-blue-300">
                      {formik.values.receiver.name}
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-400">
                      {formik.values.receiver.jobTitle} -{' '}
                      {formik.values.receiver.department}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Header Data */}
            <Card>
              <div className="flex flex-col justify-start h-full w-full">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center w-full gap-2 dark:text-white">
                  <HiChevronRight className="text-blue-500" /> Datos Generales
                </h3>
                <div className="flex flex-col gap-4">
                  <DateInput
                    field={formik.getFieldProps('date')}
                    form={formik}
                    label="Fecha del Resguardo"
                    id="date"
                  />
                  <TextArea
                    field={formik.getFieldProps('comments')}
                    form={formik}
                    label="Comentarios / Observaciones"
                    id="comments"
                    placeholder="Detalles adicionales sobre la entrega..."
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
                <FaFileContract className="text-purple-500" /> Equipos en
                Resguardo
              </h3>
              <Badge color="info">{selectedInventories.length} item(s)</Badge>
            </div>

            <div className="mb-6">
              <AutoCompleteInput
                key={inventorySearchKey}
                field={{ name: 'search_inventory', value: '' }}
                form={inventoryFormWrapper}
                options={allInventories.map((i) => {
                  const searchTerms = [
                    i.model?.name,
                    i.model?.brand?.name,
                    i.model?.type?.name,
                    i.serialNumber,
                    i.activeNumber,
                    i.comments,
                    i.invoice?.code,
                    i.purchaseOrder?.code,
                    i.purchaseOrder?.supplier,
                    i.location?.name,
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const isSelected = selectedInventories.some(
                    (inv) => inv.id === i.id,
                  );

                  return {
                    label: `${i.model?.name || 'S/M'} (${
                      i.model?.brand?.name || 'S/B'
                    }) - SN: ${i.serialNumber}`,
                    value: i.id,
                    isSelected,
                    searchTerms,
                  };
                })}
                onSearch={handleSearchInventories}
                isLoading={isInventoriesLoading}
                onFocusSearch={true}
                placeholder="Busca por serie, modelo, activo, marca..."
                label="Buscar y Agregar Equipo"
              />
            </div>

            {selectedInventories.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <Table hoverable striped>
                  <Table.Head>
                    <Table.HeadCell>Equipo</Table.HeadCell>
                    <Table.HeadCell>Serie / Activo</Table.HeadCell>
                    <Table.HeadCell>Características de Entrega</Table.HeadCell>
                    <Table.HeadCell className="w-10">
                      <span className="sr-only">Eliminar</span>
                    </Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y text-sm">
                    {selectedInventories.map((inv) => (
                      <Table.Row
                        key={inv.id}
                        className="bg-white dark:bg-gray-800"
                      >
                        <Table.Cell className="font-medium text-gray-900 dark:text-white">
                          <div className="flex flex-col">
                            <span className="font-bold">{inv.model?.name}</span>
                            <span className="text-xs text-gray-500">
                              {inv.model?.brand?.name} - {inv.model?.type?.name}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col font-mono text-xs">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              SN: {inv.serialNumber}
                            </span>
                            <span className="text-gray-500">
                              Act: {inv.activeNumber || '—'}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <TextInput
                            field={{
                              name: `features-${inv.id}`,
                              value: inv.features,
                              onChange: (e) =>
                                handleFeatureChange(inv.id, e.target.value),
                            }}
                            form={{ touched: {}, errors: {} }}
                            sizing="sm"
                            placeholder="Ej: Cargador, Mouse, Funda..."
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <button
                            onClick={() => handleRemoveInventory(inv.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            type="button"
                          >
                            <HiTrash size={20} />
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <FaFileContract
                  className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                  size={40}
                />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No has seleccionado equipos para este resguardo.
                </p>
              </div>
            )}
            {formik.touched.items && formik.errors.items && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                Debe agregar al menos un equipo
              </p>
            )}
          </Card>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 !mb-12">
            <Card>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                    <HiPencilAlt className="text-blue-500" /> Firma del Receptor
                  </h3>
                  <Button
                    size="xs"
                    color={isReceiverLocked ? 'failure' : 'success'}
                    onClick={() => setIsReceiverLocked(!isReceiverLocked)}
                    className="flex items-center gap-1"
                  >
                    {isReceiverLocked ? (
                      <HiLockClosed className="h-3 w-3" />
                    ) : (
                      <HiLockOpen className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <Button
                  size="xs"
                  color="light"
                  onClick={() => receiverSigPad.current.clear()}
                  disabled={isReceiverLocked}
                >
                  <HiX className="mr-1 h-3 w-3" /> Limpiar
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner relative">
                {isReceiverLocked && (
                  <div className="absolute inset-0 z-10 bg-gray-100/30 backdrop-blur-[1px] flex items-center justify-center">
                    <HiLockClosed className="text-gray-400 text-4xl" />
                  </div>
                )}
                <SignatureCanvas
                  ref={receiverSigPad}
                  penColor="black"
                  canvasProps={{ className: 'w-full h-64 cursor-crosshair' }}
                />
              </div>
              <p className="mt-2 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                Firma Digital
              </p>
            </Card>

            <Card>
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                    <FaUserTie className="text-green-500" /> Firma Responsable
                    TI
                  </h3>
                  {isEditMode &&
                  originalDeliverer &&
                  user &&
                  originalDeliverer.id === user.id ? (
                    <Button
                      size="xs"
                      color={isDelivererLocked ? 'failure' : 'success'}
                      onClick={() => setIsDelivererLocked(!isDelivererLocked)}
                      className="flex items-center gap-1"
                    >
                      {isDelivererLocked ? (
                        <HiLockClosed className="h-3 w-3" />
                      ) : (
                        <HiLockOpen className="h-3 w-3" />
                      )}
                    </Button>
                  ) : !isEditMode ? (
                    <Button
                      size="xs"
                      color={isDelivererLocked ? 'failure' : 'success'}
                      onClick={() => setIsDelivererLocked(!isDelivererLocked)}
                      className="flex items-center gap-1"
                    >
                      {isDelivererLocked ? (
                        <HiLockClosed className="h-3 w-3" />
                      ) : (
                        <HiLockOpen className="h-3 w-3" />
                      )}
                    </Button>
                  ) : null}
                </div>
                <div className="flex gap-1">
                  {(isEditMode &&
                    originalDeliverer &&
                    user &&
                    originalDeliverer.id === user.id) ||
                  !isEditMode ? (
                    <>
                      {initialDelivererSignature && (
                        <Button
                          size="xs"
                          color="purple"
                          onClick={handleReestablishDelivererSignature}
                          disabled={isDelivererLocked}
                          className="!p-1"
                          title="Papelera/Restablecer"
                        >
                          <HiRefresh className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => delivererSigPad.current.clear()}
                        disabled={isDelivererLocked}
                      >
                        <HiX className="mr-1 h-3 w-3" /> Limpiar
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner relative">
                {isDelivererLocked && (
                  <div className="absolute inset-0 z-10 bg-gray-100/30 backdrop-blur-[1px] flex items-center justify-center">
                    <HiLockClosed className="text-gray-400 text-4xl" />
                  </div>
                )}
                <SignatureCanvas
                  ref={delivererSigPad}
                  penColor="black"
                  onBegin={() => setIsDelivererSignatureChanged(true)}
                  canvasProps={{ className: 'w-full h-64 cursor-crosshair' }}
                />
              </div>
              <p className="mt-2 text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                Firma Digital
              </p>
            </Card>
          </div>

          {/* Footer Actions */}
          {/* <div className="flex flex-col md:flex-row justify-center items-center gap-4 border-t pt-8 pb-12">
            <Button
              type="submit"
              size="xl"
              color="info"
              isProcessing={isSubmitting}
              className="w-full md:w-80 shadow-xl hover:scale-105 transition-transform"
            >
              <HiCheckCircle className="mr-3 h-6 w-6" /> Finalizar y Generar
              Resguardo
            </Button>
            <p className="text-xs text-gray-400 italic font-medium max-w-[200px] text-center">
              * El resguardo se marcará como completado y se generará el PDF
              oficial.
            </p>
          </div> */}
        </form>

        {/* Missing Data Modal */}
        <Modal
          show={isMissingDataModalOpen}
          onClose={() => {}}
          dismissible={false}
        >
          <Modal.Header>Completar Datos del Usuario</Modal.Header>
          <Modal.Body>
            <FormikProvider value={updateFormik}>
              <div className="space-y-6">
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  El usuario seleccionado no tiene todos los datos necesarios
                  para el resguardo. Por favor, complételos a continuación.
                </p>
                <form
                  onSubmit={updateFormik.handleSubmit}
                  className="space-y-4"
                >
                  <TextInput
                    field={updateFormik.getFieldProps('employeeNumber')}
                    form={updateFormik}
                    label="Número de Empleado"
                  />
                  <TextInput
                    field={updateFormik.getFieldProps('jobTitle')}
                    form={updateFormik}
                    label="Puesto"
                  />
                  <TextInput
                    field={updateFormik.getFieldProps('department')}
                    form={updateFormik}
                    label="Departamento"
                  />
                </form>
              </div>
            </FormikProvider>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={updateFormik.handleSubmit}
              isProcessing={updateFormik.isSubmitting}
            >
              Guardar y Continuar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Signature Update Modal */}
        <Modal
          show={isSignatureUpdateModalOpen}
          onClose={() => setIsSignatureUpdateModalOpen(false)}
        >
          <Modal.Header>Actualizar Firma Digital</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Has modificado tu firma de entrega. ¿Deseas guardar esta nueva
                firma en tu perfil para futuros resguardos?
              </p>
              {user?.signature && (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                  Nota: Esto reemplazará tu firma actual guardada.
                </p>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={handleSaveSignatureAndSubmit}
              isProcessing={isSubmitting}
              disabled={isSubmitting}
            >
              Sí, guardar y continuar
            </Button>
            <Button
              color="gray"
              onClick={handleContinueWithoutSaving}
              disabled={isSubmitting}
            >
              No, solo usar para este resguardo
            </Button>
          </Modal.Footer>
        </Modal>
      </FormikProvider>
    </div>
  );
};

export default CreateCustody;
