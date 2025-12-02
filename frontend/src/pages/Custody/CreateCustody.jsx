import React, { useState, useRef, useEffect } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import SignatureCanvas from 'react-signature-canvas';
import { createCustodyRecord } from '../../services/custody.api';
import { searchUsers } from '../../services/searchUsers.api';
import { searchInventories } from '../../services/searchInventories.api';
import { updateUser, API_URL } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { Button, Label, Card, Checkbox, Table, Modal } from 'flowbite-react';
import { HiTrash } from 'react-icons/hi';
import AutoCompleteInput from '../../components/Inputs/AutoCompleteInput';
import TextInput from '../../components/Inputs/TextInput';
import TextArea from '../../components/Inputs/TextArea';
import DateInput from '../../components/Inputs/DateInput';
import ActionButtons from '../../components/ActionButtons/ActionButtons';

const CreateCustody = () => {
  const navigate = useNavigate();
  const { user, updateSignature } = useAuthContext();
  const receiverSigPad = useRef({});
  const delivererSigPad = useRef({});

  const [selectedInventories, setSelectedInventories] = useState([]);
  const [isNewUserMode, setIsNewUserMode] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [allInventories, setAllInventories] = useState([]);
  const [inventorySearchKey, setInventorySearchKey] = useState(0);

  // Modal state for missing user data
  const [isMissingDataModalOpen, setIsMissingDataModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);

  // Signature update state
  const [isSignatureUpdateModalOpen, setIsSignatureUpdateModalOpen] =
    useState(false);
  const [pendingCustodyPayload, setPendingCustodyPayload] = useState(null);
  const [isDelivererSignatureChanged, setIsDelivererSignatureChanged] =
    useState(false);

  // Load saved signature
  useEffect(() => {
    const loadSignature = async () => {
      if (user?.signature?.url && delivererSigPad.current) {
        try {
          const response = await fetch(`${API_URL}/${user.signature.url}`);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            delivererSigPad.current.fromDataURL(reader.result, {
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

  // Fetch all users and inventories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await searchUsers({ searchTerm: '', pageSize: 1000 });
        setAllUsers(usersRes.data || []);

        const invRes = await searchInventories({
          searchTerm: '',
          pageSize: 1000,
          status: 'ALTA',
        });
        setAllInventories(invRes.data || []);
      } catch (error) {
        console.error('Error fetching data', error);
        toast.error('Error cargando datos iniciales');
      }
    };
    fetchData();
  }, []);

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
        delivererUserId: user?.id,
      };

      // Check if signature changed and user has existing signature
      if (isDelivererSignatureChanged) {
        setPendingCustodyPayload(payload);
        setIsSignatureUpdateModalOpen(true);
      } else {
        await submitCustody(payload);
      }
    },
  });

  const submitCustody = async (payload) => {
    try {
      const res = await createCustodyRecord(payload);
      toast.success('Resguardo creado exitosamente');
      navigate('/custody');
    } catch (error) {
      toast.error(
        'Error al crear resguardo: ' +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleSaveSignatureAndSubmit = async () => {
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
      await submitCustody(pendingCustodyPayload);
      setIsSignatureUpdateModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar firma');
    }
  };

  const handleContinueWithoutSaving = async () => {
    await submitCustody(pendingCustodyPayload);
    setIsSignatureUpdateModalOpen(false);
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
    setSelectedInventories([...selectedInventories, { ...inv, features: '' }]);
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
    <FormikProvider value={formik}>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Nuevo Resguardo de Equipo
        </h1>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="w-full md:w-1/3">
            <DateInput
              field={formik.getFieldProps('date')}
              form={formik}
              label="Fecha"
              id="date"
            />
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Datos del Empleado (Receptor)
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                id="isNewUser"
                checked={isNewUserMode}
                onChange={(e) => {
                  setIsNewUserMode(e.target.checked);
                  formik.setFieldValue(
                    'receiver.isNewInactiveUser',
                    e.target.checked,
                  );
                  if (e.target.checked) {
                    formik.setFieldValue('receiver.userId', null);
                  }
                }}
              />
              <Label htmlFor="isNewUser">
                Registrar nuevo usuario (Inactivo)
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
                  label: `${u.firstName} ${u.lastName} (${u.email})`,
                  value: u.id,
                }))}
                placeholder="Buscar Empleado..."
                label="Buscar Empleado"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  field={formik.getFieldProps('receiver.firstName')}
                  form={formik}
                  label="Nombre"
                />
                <TextInput
                  field={formik.getFieldProps('receiver.lastName')}
                  form={formik}
                  label="Apellido"
                />
                <TextInput
                  field={formik.getFieldProps('receiver.email')}
                  form={formik}
                  label="Correo Electrónico"
                />
                <TextInput
                  field={formik.getFieldProps('receiver.userName')}
                  form={formik}
                  label="Nombre de Usuario"
                />
                <TextInput
                  field={formik.getFieldProps('receiver.employeeNumber')}
                  form={formik}
                  label="Número de Empleado"
                />
                <TextInput
                  field={formik.getFieldProps('receiver.jobTitle')}
                  form={formik}
                  label="Puesto"
                />
                <TextInput
                  field={formik.getFieldProps('receiver.department')}
                  form={formik}
                  label="Departamento"
                />
              </div>
            )}

            {!isNewUserMode && formik.values.receiver.userId && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p>
                  <strong>Seleccionado:</strong> {formik.values.receiver.name}
                </p>
                <p className="text-sm text-gray-600">
                  {formik.values.receiver.jobTitle} -{' '}
                  {formik.values.receiver.department}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Equipos a Resguardar</h2>
            <div className="mb-4">
              <AutoCompleteInput
                key={inventorySearchKey}
                field={{ name: 'inventorySearch', value: '' }}
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
                    i.invoice?.concept,
                    i.invoice?.supplier,
                    i.purchaseOrder?.code,
                    i.purchaseOrder?.supplier,
                    i.purchaseOrder?.description,
                    i.invoice?.purchaseOrder?.code,
                    i.invoice?.purchaseOrder?.project?.name,
                    i.invoice?.purchaseOrder?.project?.code,
                    i.purchaseOrder?.project?.name,
                    i.purchaseOrder?.project?.code,
                    i.location?.name,
                    ...(i.conditions?.map((c) => c.condition?.name) || []),
                    ...(i.customField?.map((cf) => cf.value) || []),
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return {
                    label: `${i.model?.name || 'Sin Modelo'} (${
                      i.model?.brand?.name || 'Sin Marca'
                    }) - SN: ${i.serialNumber || 'S/N'}`,
                    value: i.id,
                    searchTerms,
                  };
                })}
                placeholder="Buscar por serie, modelo, factura, OC, proyecto, comentarios..."
                label="Buscar Inventario"
              />
            </div>

            {selectedInventories.length > 0 ? (
              <div className="overflow-x-auto">
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Equipo</Table.HeadCell>
                    <Table.HeadCell>Serie / Activo</Table.HeadCell>
                    <Table.HeadCell>Factura</Table.HeadCell>
                    <Table.HeadCell>Características</Table.HeadCell>
                    <Table.HeadCell>
                      <span className="sr-only">Eliminar</span>
                    </Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {selectedInventories.map((inv) => (
                      <Table.Row
                        key={inv.id}
                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          <div className="flex flex-col">
                            <span className="font-bold text-lg">
                              {inv.model?.name || 'Sin Modelo'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {inv.model?.type?.name} - {inv.model?.brand?.name}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              SN: {inv.serialNumber}
                            </span>
                            {inv.activeNumber && (
                              <span className="text-xs text-gray-500">
                                Activo: {inv.activeNumber}
                              </span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell>{inv.invoice?.code || 'N/A'}</Table.Cell>
                        <Table.Cell>
                          <TextInput
                            field={{
                              name: `features-${inv.id}`,
                              value: inv.features,
                              onChange: (e) =>
                                handleFeatureChange(inv.id, e.target.value),
                              onBlur: () => {},
                            }}
                            form={{ touched: {}, errors: {} }}
                            sizing="sm"
                            placeholder="Cargador, mouse, detalles..."
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <button
                            onClick={() => handleRemoveInventory(inv.id)}
                            className="font-medium text-red-600 hover:underline dark:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                            title="Eliminar equipo"
                            type="button"
                          >
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No hay equipos seleccionados
              </p>
            )}
            {formik.errors.items && (
              <p className="text-red-500 text-sm">{formik.errors.items}</p>
            )}
          </Card>

          <div>
            <TextArea
              field={formik.getFieldProps('comments')}
              form={formik}
              label="Comentarios"
              id="comments"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-semibold mb-2">Firma de Recibí (Empleado)</h3>
              <div className="border border-gray-300 rounded">
                <SignatureCanvas
                  ref={receiverSigPad}
                  penColor="black"
                  canvasProps={{
                    width: 350,
                    height: 150,
                    className: 'sigCanvas w-full',
                  }}
                />
              </div>
              <Button
                size="xs"
                color="light"
                onClick={() => receiverSigPad.current.clear()}
                className="mt-2"
              >
                Limpiar Firma
              </Button>
            </Card>

            <Card>
              <h3 className="font-semibold mb-2">Firma de Entrega (TI)</h3>
              <div className="border border-gray-300 rounded">
                <SignatureCanvas
                  ref={delivererSigPad}
                  penColor="black"
                  onBegin={() => setIsDelivererSignatureChanged(true)}
                  canvasProps={{
                    width: 350,
                    height: 150,
                    className: 'sigCanvas w-full',
                  }}
                />
              </div>
              <Button
                size="xs"
                color="light"
                onClick={() => delivererSigPad.current.clear()}
                className="mt-2"
              >
                Limpiar Firma
              </Button>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <ActionButtons
              onCancel={() => navigate('/custody')}
              labelCancel="Cancelar"
              extraActions={[
                {
                  key: 'save',
                  label: 'Generar Resguardo',
                  action: formik.handleSubmit,
                  color: 'blue',
                  disabled: formik.isSubmitting,
                },
              ]}
            />
          </div>
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
            <Button onClick={handleSaveSignatureAndSubmit}>
              Sí, guardar y continuar
            </Button>
            <Button color="gray" onClick={handleContinueWithoutSaving}>
              No, solo usar para este resguardo
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </FormikProvider>
  );
};

export default CreateCustody;
