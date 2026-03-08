import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import AccountFields from '../../components/AccountFields/AccountFields';
import ModalForm from '../../components/Modals/ModalForm';
import ChangePasswordForm from '../../components/AccountFields/ChangePassword/ChangePasswordForm';
import withPermission from '../../utils/withPermissions';
import useCheckPermissions from '../../hooks/useCheckPermissions';
import SignatureCanvas from 'react-signature-canvas';
import { API_URL } from '../../services/api';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';
import NoImageFound from '../../assets/images/NoImageFound.jpg';
import {
  Camera,
  KeyRound,
  PenTool,
  Save,
  X,
  Pencil,
  User,
  Shield,
  Phone,
  Mail,
  Hash,
  Briefcase,
  Building2,
  UserCircle,
  Trash2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

/* ─── nav items config ──────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    id: 'profile',
    label: 'Mi Perfil',
    description: 'Datos personales',
    icon: User,
  },
  {
    id: 'security',
    label: 'Seguridad',
    description: 'Contraseña y acceso',
    icon: Shield,
  },
  {
    id: 'signature',
    label: 'Firma Digital',
    description: 'Documentos oficiales',
    icon: PenTool,
  },
];

/* ─── helpers ───────────────────────────────────────────────────────────────── */
const SideNavItem = ({ active, onClick, icon: Icon, label, description }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
      active
        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
        : 'hover:bg-(--surface-muted) text-(--foreground-muted) hover:text-(--foreground)'
    }`}
  >
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
        active
          ? 'bg-white/20'
          : 'bg-(--surface-muted) group-hover:bg-(--border)'
      }`}
    >
      <Icon size={15} />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold leading-none">{label}</p>
      <p
        className={`text-xs mt-0.5 truncate ${
          active ? 'text-purple-200' : 'text-(--foreground-muted)'
        }`}
      >
        {description}
      </p>
    </div>
  </button>
);

const MobilePill = ({ active, onClick, icon: Icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
      active
        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
        : 'bg-(--surface) border border-(--border) text-(--foreground-muted) hover:text-(--foreground)'
    }`}
  >
    <Icon size={14} />
    {label}
  </button>
);

/* ─── main component ────────────────────────────────────────────────────────── */
const Account = () => {
  const inputRef = useRef(null);
  const sigPad = useRef({});
  const changePassFormRef = useRef(null);
  const {
    user,
    updateProfileImage,
    updateProfile,
    updatePassword,
    updateSignature,
  } = useAuthContext();

  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(user?.photo || '');
  const [imagePreview, setImagePreview] = useState(null);
  const [userFields, setUserFields] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [passwordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureImage, setSignatureImage] = useState(user?.signature || null);
  const [uploadFeedback, setUploadFeedback] = useState(null);
  const [sigUploadRef] = useState({ current: null });

  /* ─── permissions ─────────────────────────────────────────────────────────── */
  const isEditAccountPermission = useCheckPermissions('edit_account');
  const isChangePassPermission = useCheckPermissions('change_password');
  const isUpdateImagePermission = useCheckPermissions('change_account_image');
  const isAdminOrRoot =
    user?.role?.name === 'Admin' || user?.role?.name === 'Root';
  // Can trigger edit mode: admins always, others only with explicit permission
  const canEditProfile = isAdminOrRoot || isEditAccountPermission.hasPermission;
  // Signature update: admin/root only
  const canEditSignature = isAdminOrRoot;

  /* ─── field definitions ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    setUserFields([
      {
        id: 'email',
        label: 'Correo electrónico',
        name: 'email',
        icon: Mail,
        inputType: 'email',
        // admin/root only
        allowEdit: isAdminOrRoot,
        value: user.email || '',
        onChange: handleFieldChange,
      },
      {
        id: 'userName',
        label: 'Nombre de usuario',
        name: 'userName',
        icon: UserCircle,
        // admin/root only
        allowEdit: isAdminOrRoot,
        value: user.userName || '',
        onChange: handleFieldChange,
      },
      {
        id: 'firstName',
        label: 'Nombre',
        name: 'firstName',
        icon: User,
        // any user with edit_account (or admin/root)
        allowEdit: canEditProfile,
        value: user.firstName || '',
        onChange: handleFieldChange,
      },
      {
        id: 'lastName',
        label: 'Apellidos',
        name: 'lastName',
        icon: User,
        allowEdit: canEditProfile,
        value: user.lastName || '',
        onChange: handleFieldChange,
      },
      {
        id: 'phone',
        label: 'Teléfono',
        name: 'phone',
        icon: Phone,
        inputType: 'tel',
        allowEdit: canEditProfile,
        value: user.phone || '',
        onChange: handleFieldChange,
      },
      {
        id: 'employeeNumber',
        label: 'Número de Empleado',
        name: 'employeeNumber',
        icon: Hash,
        // admin/root only
        allowEdit: isAdminOrRoot,
        value: user.employeeNumber || '',
        onChange: handleFieldChange,
      },
      {
        id: 'jobTitle',
        label: 'Puesto',
        name: 'jobTitle',
        icon: Briefcase,
        // admin/root only
        allowEdit: isAdminOrRoot,
        value: user.jobTitle || '',
        onChange: handleFieldChange,
      },
      {
        id: 'department',
        label: 'Departamento',
        name: 'department',
        icon: Building2,
        // admin/root only
        allowEdit: isAdminOrRoot,
        value: user.department || '',
        onChange: handleFieldChange,
      },
    ]);
    setSignatureImage(user?.signature || null);
    setImage(user?.photo || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setUserFields((prev) =>
      prev.map((f) => (f.name === name ? { ...f, value } : f)),
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (image instanceof File) {
      const res = await updateProfileImage(image);
      if (res) {
        setImage(res.photo);
        setImagePreview(null);
        setUploadFeedback('success');
        setTimeout(() => setUploadFeedback(null), 3000);
      }
    }
  };

  const handleDiscardImage = () => {
    setImage(user?.photo || '');
    setImagePreview(null);
  };

  const onSaveFieldChanges = () => {
    const data = userFields.reduce(
      (acc, f) => ({ ...acc, [f.name]: f.value }),
      {},
    );
    updateProfile({ ...data, userId: user.id });
    setIsEditing(false);
  };

  const handleDiscardFieldChanges = () => {
    setUserFields((prev) =>
      prev.map((f) => ({ ...f, value: user[f.name] || '' })),
    );
    setIsEditing(false);
  };

  const onChangePassword = async (values, { setSubmitting, resetForm }) => {
    try {
      await updatePassword(values);
      setSubmitting(false);
      resetForm();
      setIsOpenModal(false);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al actualizar la contraseña',
      );
      setSubmitting(false);
    }
  };

  const avatarSrc = imagePreview
    ? imagePreview
    : FormattedUrlImage(image) || NoImageFound;

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName
    : '—';

  /* ─── signature save handler ──────────────────────────────────────────────── */
  const handleSaveSignature = async () => {
    let fileToUpload = null;
    if (sigUploadRef.current?.files?.[0]) {
      fileToUpload = sigUploadRef.current.files[0];
    } else if (sigPad.current && !sigPad.current.isEmpty()) {
      const dataUrl = sigPad.current.getCanvas().toDataURL('image/png');
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      fileToUpload = new File([blob], 'signature.png', { type: 'image/png' });
    }
    if (fileToUpload) {
      try {
        await updateSignature(fileToUpload);
        setIsSignatureModalOpen(false);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Por favor dibuja o sube una firma.');
    }
  };

  /* ─── render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-5 pb-12">
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg">
        <div className="h-32 bg-linear-to-r from-purple-700 via-purple-500 to-violet-400" />
        <div className="bg-(--surface) px-6 pb-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
            {/* avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl ring-4 ring-(--surface) shadow-xl overflow-hidden bg-purple-100">
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              {isUpdateImagePermission.hasPermission && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md flex items-center justify-center transition-colors"
                  title="Cambiar foto"
                >
                  <Camera size={13} />
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                hidden
                onChange={handleImageChange}
              />
            </div>

            {/* name / role */}
            <div className="flex-1 text-center sm:text-left pb-1">
              <h1 className="text-xl font-bold text-(--foreground) leading-tight">
                {displayName}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                {user?.role?.name && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    <Shield size={11} />
                    {user.role.name}
                  </span>
                )}
                {user?.department && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--surface-muted) text-(--foreground-muted)">
                    <Building2 size={11} />
                    {user.department}
                  </span>
                )}
                {user?.jobTitle && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--surface-muted) text-(--foreground-muted)">
                    <Briefcase size={11} />
                    {user.jobTitle}
                  </span>
                )}
              </div>
            </div>

            {/* photo save/discard inline */}
            {imagePreview && (
              <div className="flex gap-2 pb-1">
                <button
                  type="button"
                  onClick={handleDiscardImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <X size={13} />
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-colors"
                >
                  <UploadCloud size={13} />
                  Guardar foto
                </button>
              </div>
            )}
            {uploadFeedback === 'success' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pb-1">
                <CheckCircle2 size={14} />
                Foto actualizada
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY: aside + content ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:items-start">
        {/* ── SIDEBAR ──────────────────────────────────────────────── */}
        <aside className="w-full lg:w-56 xl:w-60 shrink-0 lg:sticky lg:top-4">
          {/* Mobile: horizontal pills */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {NAV_SECTIONS.map((s) => (
              <MobilePill
                key={s.id}
                active={activeSection === s.id}
                onClick={() => setActiveSection(s.id)}
                icon={s.icon}
                label={s.label}
              />
            ))}
          </div>
          {/* Desktop: vertical card nav */}
          <nav className="hidden lg:flex flex-col gap-1 bg-(--surface) border border-(--border) rounded-2xl p-2 shadow-sm">
            <p className="px-3 pt-1 pb-2 text-[10px] font-bold uppercase tracking-widest text-(--foreground-muted)">
              Configuración
            </p>
            {NAV_SECTIONS.map((s) => (
              <SideNavItem
                key={s.id}
                active={activeSection === s.id}
                onClick={() => setActiveSection(s.id)}
                icon={s.icon}
                label={s.label}
                description={s.description}
              />
            ))}
          </nav>
        </aside>

        {/* ── CONTENT ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* ── PROFILE SECTION ───────────────────────────────────── */}
          {activeSection === 'profile' && (
            <div className="bg-(--surface) rounded-2xl border border-(--border) shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-(--foreground)">
                    Información de la cuenta
                  </h2>
                  <p className="text-xs text-(--foreground-muted) mt-0.5">
                    {isEditing
                      ? 'Modifica los campos y guarda los cambios.'
                      : 'Revisa los datos de tu perfil.'}
                  </p>
                </div>
                {!isEditing && canEditProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userFields.map((field) => (
                  <AccountFields
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    allowEdit={field.allowEdit}
                    isEditing={isEditing}
                    inputType={field.inputType}
                    icon={field.icon}
                  />
                ))}
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-(--border)">
                  <button
                    type="button"
                    onClick={handleDiscardFieldChanges}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <X size={14} />
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={onSaveFieldChanges}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20 transition-colors"
                  >
                    <Save size={14} />
                    Guardar cambios
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── SECURITY SECTION ──────────────────────────────────── */}
          {activeSection === 'security' && (
            <div className="bg-(--surface) rounded-2xl border border-(--border) shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <KeyRound size={18} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-(--foreground)">
                    Contraseña y acceso
                  </h2>
                  <p className="text-xs text-(--foreground-muted)">
                    Gestiona la seguridad de tu cuenta
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-(--border) bg-(--surface-muted) p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-(--surface) border border-(--border) flex items-center justify-center shrink-0">
                    <Lock size={15} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">
                      Contraseña
                    </p>
                    <p className="text-xs text-(--foreground-muted) mt-0.5">
                      Mínimo 8 caracteres con letras y números
                    </p>
                  </div>
                </div>
                {isChangePassPermission.hasPermission && (
                  <button
                    type="button"
                    onClick={() => setIsOpenModal(true)}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20 transition-colors"
                  >
                    <KeyRound size={14} />
                    Cambiar contraseña
                  </button>
                )}
              </div>

              {/* Change password modal — uses ModalForm with actions prop */}
              <ModalForm
                isOpenModal={isOpenModal}
                onClose={() => {
                  setIsOpenModal(false);
                  setError(null);
                }}
                title="Cambiar contraseña"
                size="md"
                actions={[
                  {
                    label: 'Limpiar',
                    action: () => changePassFormRef.current?.resetForm(),
                    icon: Trash2,
                    color: 'red',
                  },
                  {
                    label: 'Cambiar contraseña',
                    action: () => changePassFormRef.current?.submitForm(),
                    icon: Lock,
                    color: 'primary',
                    filled: true,
                  },
                ]}
              >
                <div className="flex flex-col items-center gap-1.5 pb-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Shield size={24} className="text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-(--foreground) text-center">
                    Actualiza tu contraseña de acceso
                  </p>
                  <p className="text-xs text-(--foreground-muted) text-center">
                    Usa al menos 8 caracteres con letras y números
                  </p>
                </div>
                <ChangePasswordForm
                  initialValues={passwordFields}
                  onSubmit={onChangePassword}
                  error={error}
                  formikRef={changePassFormRef}
                />
              </ModalForm>
            </div>
          )}

          {/* ── SIGNATURE SECTION ─────────────────────────────────── */}
          {activeSection === 'signature' && (
            <div className="bg-(--surface) rounded-2xl border border-(--border) shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <PenTool size={18} className="text-violet-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-(--foreground)">
                    Firma Digital
                  </h2>
                  <p className="text-xs text-(--foreground-muted)">
                    Tu firma se usará en resguardos y documentos oficiales
                  </p>
                </div>
              </div>

              {signatureImage ? (
                <div className="rounded-2xl border border-(--border) bg-(--surface-muted) p-5 flex flex-col items-center gap-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-(--foreground-muted)">
                    Firma actual
                  </p>
                  <div className="bg-white rounded-xl border border-(--border) shadow-inner px-8 py-4 max-w-xs w-full flex items-center justify-center">
                    <img
                      src={`${API_URL}/${signatureImage.url}`}
                      alt="Firma digital"
                      className="max-h-24 object-contain"
                    />
                  </div>
                  {canEditSignature && (
                    <button
                      type="button"
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-violet-300 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                    >
                      <Pencil size={14} />
                      Actualizar firma
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-(--border) bg-(--surface-muted) p-10 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <PenTool size={28} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">
                      Sin firma registrada
                    </p>
                    <p className="text-xs text-(--foreground-muted) mt-1">
                      {canEditSignature
                        ? 'Crea tu firma digital para usarla en documentos oficiales'
                        : 'Solo administradores pueden crear la firma digital'}
                    </p>
                  </div>
                  {canEditSignature && (
                    <button
                      type="button"
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20 transition-colors"
                    >
                      <PenTool size={14} />
                      Crear firma
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── SIGNATURE MODAL ──────────────────────────────────────────────────── */}
      <ModalForm
        isOpenModal={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        title={
          signatureImage ? 'Actualizar Firma Digital' : 'Crear Firma Digital'
        }
        size="md"
        actions={[
          {
            label: 'Limpiar',
            action: () => sigPad.current?.clear(),
            icon: Trash2,
            color: 'red',
          },
          {
            label: 'Guardar firma',
            action: handleSaveSignature,
            icon: Save,
            color: 'primary',
            filled: true,
          },
        ]}
      >
        <div className="flex flex-col gap-5">
          {signatureImage && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>
                Ya tienes una firma guardada. Guardar una nueva reemplazará la
                anterior.
              </span>
            </div>
          )}

          {/* canvas */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--foreground-muted)">
              Dibuja tu firma
            </p>
            <div className="flex justify-center rounded-xl border-2 border-dashed border-(--border) bg-white">
              <SignatureCanvas
                ref={sigPad}
                penColor="#1e293b"
                canvasProps={{
                  className: 'cursor-crosshair block',
                  width: 320,
                  height: 150,
                }}
              />
            </div>
          </div>

          {/* divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-(--border)" />
            <span className="text-xs text-(--foreground-muted) font-medium">
              O
            </span>
            <div className="flex-1 border-t border-(--border)" />
          </div>

          {/* file upload */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--foreground-muted)">
              Sube una imagen de tu firma
            </p>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-(--border) bg-(--surface-muted) p-5 cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
              <UploadCloud size={22} className="text-purple-400" />
              <span className="text-xs text-(--foreground-muted)">
                PNG, JPG o WEBP · máx. 5 MB
              </span>
              <input
                ref={(el) => (sigUploadRef.current = el)}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </label>
          </div>
        </div>
      </ModalForm>
    </div>
  );
};

const ProtectedAccountView = withPermission(Account, 'view_account');

export default ProtectedAccountView;
