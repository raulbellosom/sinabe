import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { RiImageEditLine, RiLockPasswordFill } from 'react-icons/ri';
import { MdImageSearch, MdPassword } from 'react-icons/md';
import { LuImageOff } from 'react-icons/lu';
import AccountFields from '../../components/AccountFields/AccountFields';
import ModalForm from '../../components/Modals/ModalForm';
import ChangePasswordForm from '../../components/AccountFields/ChangePassword/ChangePasswordForm';
import { FaSave, FaPenNib } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { AiFillEdit } from 'react-icons/ai';
import withPermission from '../../utils/withPermissions';
import useCheckPermissions from '../../hooks/useCheckPermissions';
import SignatureCanvas from 'react-signature-canvas';
import { Button, Modal } from 'flowbite-react';
import { API_URL } from '../../services/api';

const Account = () => {
  const inputRef = useRef(null);
  const sigPad = useRef({});
  const {
    user,
    updateProfileImage,
    updateProfile,
    updatePassword,
    updateSignature,
  } = useAuthContext();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [extraActions, setExtraActions] = useState([]);
  const [image, setImage] = useState(user?.photo || '');
  const [userFields, setUserFields] = useState([]);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureImage, setSignatureImage] = useState(user?.signature || null);

  useEffect(() => {
    if (image && image instanceof File && image !== user?.photo) {
      setExtraActions([
        {
          label: 'Descartar cambios',
          icon: LuImageOff,
          action: () => setImage(user?.photo || ''),
          color: 'red',
        },
        {
          label: 'Guardar cambios',
          icon: RiImageEditLine,
          action: () => handleImageUpload(),
          filled: image ? true : false,
          color: 'mycad',
        },
      ]);
    } else {
      setExtraActions([
        {
          label: 'Seleccionar imagen',
          icon: MdImageSearch,
          action: () => inputRef.current.click(),
          color: 'stone',
        },
      ]);
    }
  }, [image]);

  useEffect(() => {
    setUserFields([
      {
        id: 'email',
        label: 'Correo electrónico',
        name: 'email',
        value: user.email,
        onChange: handleFieldChange,
        allowEdit:
          user.role.name === 'Admin' || user.role.name === 'Root'
            ? true
            : false,
      },
      {
        id: 'userName',
        label: 'Nombre de usuario',
        name: 'userName',
        value: user.userName,
        onChange: handleFieldChange,
        allowEdit:
          user.role.name === 'Admin' || user.role.name === 'Root'
            ? true
            : false,
      },
      {
        id: 'firstName',
        label: 'Nombre',
        name: 'firstName',
        value: user.firstName,
        onChange: handleFieldChange,
        allowEdit: true,
      },
      {
        id: 'lastName',
        label: 'Apellidos',
        name: 'lastName',
        value: user.lastName,
        onChange: handleFieldChange,
        allowEdit: true,
      },
      {
        id: 'phone',
        label: 'Teléfono',
        name: 'phone',
        value: user.phone,
        onChange: handleFieldChange,
        allowEdit: true,
        inputType: 'tel',
      },
      {
        id: 'employeeNumber',
        label: 'Número de Empleado',
        name: 'employeeNumber',
        value: user.employeeNumber,
        onChange: handleFieldChange,
        allowEdit: true,
      },
      {
        id: 'jobTitle',
        label: 'Puesto',
        name: 'jobTitle',
        value: user.jobTitle,
        onChange: handleFieldChange,
        allowEdit: true,
      },
      {
        id: 'department',
        label: 'Departamento',
        name: 'department',
        value: user.department,
        onChange: handleFieldChange,
        allowEdit: true,
      },
    ]);
    setSignatureImage(user?.signature || null);
  }, [user]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setUserFields((prev) => {
      return prev.map((field) => {
        if (field.name === name) {
          return { ...field, value };
        }

        return field;
      });
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setImage(file);
  };

  const handleImageUpload = async () => {
    if (image && image instanceof File) {
      const res = await updateProfileImage(image);
      if (res) {
        setImage(res.photo);
      }
    }
  };

  const onSaveFieldChanges = () => {
    const data = userFields.reduce((acc, field) => {
      return { ...acc, [field.name]: field.value };
    }, {});
    updateProfile({ ...data, userId: user.id });
    setIsEditing(false);
  };

  const handleDiscardFieldChanges = () => {
    setUserFields((prev) => {
      return prev.map((field) => {
        return { ...field, value: user[field.name] };
      });
    });
    setIsEditing(false);
  };

  const onChangePassword = async (values, { setSubmitting, resetForm }) => {
    try {
      await updatePassword(values);
      setSubmitting(false);
      resetForm();
      setPasswordFields({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setIsOpenModal(false);
      setError(null);
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message || 'Error al actualizar la contraseña',
      );
      setSubmitting(false);
    }
  };

  const isEditAccountPermission = useCheckPermissions('edit_account');
  const isChangePassPermission = useCheckPermissions('change_password');
  const isUpdateImagePermission = useCheckPermissions('change_account_image');

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-purple-500 mb-2">Mi cuenta</h1>
        <form className="flex flex-col items-center justify-center gap-4">
          <div className="flex justify-start w-full">
            <h2 className="text-lg font-semibold">Imagen del perfil</h2>
            {isUpdateImagePermission.hasPermission && (
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg, image/png, image/jpg, image/webp"
                hidden
                className="hidden"
                onChange={handleImageChange}
              />
            )}
          </div>
          <div className="rounded-full min-h-36 min-w-36 ring-4 ring-purple-500 p-1.5">
            <ImageViewer
              containerClassNames={
                'rounded-full overflow-hidden min-w-36 min-h-36 object-cover'
              }
              images={image ? [image] : []}
            />
          </div>
          {isUpdateImagePermission.hasPermission && (
            <div className="flex flex-col md:flex-row justify-start gap-2">
              <ActionButtons extraActions={extraActions} />
            </div>
          )}
        </form>
        <hr className="my-4" />
        <form>
          <h2 className="text-lg font-bold mb-4">Información de la cuenta</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {user &&
              userFields.map((field) => {
                return (
                  <AccountFields
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    allowEdit={field.allowEdit}
                    isEditing={isEditing}
                    inputType={field?.inputType}
                  />
                );
              })}
          </div>
          <div className="flex flex-col md:flex-row justify-end gap-4 mt-4">
            {isEditing ? (
              <ActionButtons
                extraActions={[
                  {
                    label: 'Descartar cambios',
                    icon: IoMdClose,
                    action: handleDiscardFieldChanges,
                    color: 'red',
                  },
                  {
                    label: 'Guardar cambios',
                    icon: FaSave,
                    action: onSaveFieldChanges,
                    color: 'mycad',
                    filled: true,
                  },
                ]}
              />
            ) : (
              <ActionButtons
                extraActions={[
                  {
                    label: 'Editar',
                    icon: AiFillEdit,
                    action: isEditAccountPermission.hasPermission
                      ? () => setIsEditing(true)
                      : null,
                    color: 'stone',
                  },
                ]}
              />
            )}
          </div>
        </form>
        <hr className="my-4" />

        {/* Signature Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">
            <span className="inline-block mr-2">
              <FaPenNib size={20} />
            </span>
            Firma Digital
          </h2>
          <div className="flex flex-col items-center gap-4">
            {signatureImage ? (
              <div className="border p-2 rounded bg-white">
                <img
                  src={`${API_URL}/${signatureImage.url}`}
                  alt="Firma"
                  className="max-h-32 object-contain"
                />
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay firma guardada</p>
            )}
            <Button
              color="light"
              onClick={() => setIsSignatureModalOpen(true)}
              className="w-fit"
            >
              {signatureImage ? 'Actualizar Firma' : 'Crear Firma'}
            </Button>
          </div>
        </div>

        <hr className="my-4" />
        {isChangePassPermission.hasPermission && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">
              <span className="inline-block mr-2">
                <RiLockPasswordFill size={20} />
              </span>
              Cambiar contraseña
            </h2>
            <ActionButtons
              extraActions={[
                {
                  label: 'Cambiar contraseña',
                  icon: MdPassword,
                  action: () => setIsOpenModal(true),
                  color: 'stone',
                  filled: true,
                },
              ]}
            />
            {isOpenModal && (
              <ModalForm
                isOpenModal={isOpenModal}
                onClose={() => setIsOpenModal(false)}
                title={'Cambiar contraseña'}
                size={'xl'}
              >
                <ChangePasswordForm
                  initialValues={passwordFields}
                  onSubmit={onChangePassword}
                  error={error}
                />
              </ModalForm>
            )}
          </div>
        )}

        <Modal
          show={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          size="lg"
        >
          <Modal.Header>
            {signatureImage ? 'Actualizar Firma' : 'Crear Firma'}
          </Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-4">
              {signatureImage && (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800 mb-2">
                  Ya tienes una firma guardada. Si guardas una nueva, la
                  anterior será reemplazada.
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
                <p className="mb-2 text-sm text-gray-500">
                  Dibuja tu firma aquí:
                </p>
                <div className="border border-gray-400 bg-white">
                  <SignatureCanvas
                    ref={sigPad}
                    penColor="black"
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: 'signature-canvas',
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="xs"
                    color="gray"
                    onClick={() => sigPad.current.clear()}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400">O</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="flex flex-col items-center">
                <p className="mb-2 text-sm text-gray-500">
                  Sube una imagen de tu firma:
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={async () => {
                let fileToUpload = null;
                const fileInput = document.querySelector(
                  'input[type="file"][accept="image/*"]',
                );

                if (fileInput && fileInput.files[0]) {
                  fileToUpload = fileInput.files[0];
                } else if (!sigPad.current.isEmpty()) {
                  const dataUrl = sigPad.current
                    .getCanvas()
                    .toDataURL('image/png');
                  const res = await fetch(dataUrl);
                  const blob = await res.blob();
                  fileToUpload = new File([blob], 'signature.png', {
                    type: 'image/png',
                  });
                }

                if (fileToUpload) {
                  try {
                    await updateSignature(fileToUpload);
                    setIsSignatureModalOpen(false);
                    // Refresh user data is handled by context update
                  } catch (err) {
                    console.error(err);
                  }
                } else {
                  // Show error: draw or upload
                  alert('Por favor dibuja o sube una firma.');
                }
              }}
            >
              Guardar Firma
            </Button>
            <Button color="gray" onClick={() => setIsSignatureModalOpen(false)}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    </div>
  );
};

const ProtectedAccountView = withPermission(Account, 'view_account');

export default ProtectedAccountView;
