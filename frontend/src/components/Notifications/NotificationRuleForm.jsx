/**
 * Formulario para crear/editar reglas de notificación
 * Con mejoras: SearchableSelect, modales de ayuda, campos dinámicos
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Label,
  ToggleSwitch,
  Badge,
  Spinner,
} from 'flowbite-react';
import {
  HiMail,
  HiBell,
  HiPlus,
  HiTrash,
  HiUser,
  HiAtSymbol,
  HiInformationCircle,
  HiExclamationCircle,
} from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';
import { toast } from 'react-hot-toast';
import SearchableSelect from '../common/SearchableSelect';
import { CronHelpModal, JsonFilterHelpModal } from './HelpModals';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';

const NotificationRuleForm = ({ show, onClose, onSuccess, rule }) => {
  const {
    ruleTypes,
    createRule,
    updateRule,
    getAvailableRecipients,
    getInventoryFields,
    getConditions,
  } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [inventoryFields, setInventoryFields] = useState([]);
  const [inventoryFieldsLoading, setInventoryFieldsLoading] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [conditionsLoading, setConditionsLoading] = useState(false);

  // Modales de ayuda
  const [showCronHelp, setShowCronHelp] = useState(false);
  const [showJsonHelp, setShowJsonHelp] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ruleType: '',
    enabled: true,
    scheduleType: 'INTERVAL',
    intervalMinutes: 1440, // 24 horas por defecto
    cronExpression: '',
    params: {},
    channels: [
      { channel: 'EMAIL', enabled: true },
      { channel: 'IN_APP', enabled: true },
    ],
    recipients: [],
  });

  // Cargar datos del rule al editar
  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        ruleType: rule.ruleType || '',
        enabled: rule.enabled ?? true,
        scheduleType: rule.scheduleType || 'INTERVAL',
        intervalMinutes: rule.intervalMinutes || 1440,
        cronExpression: rule.cronExpression || '',
        params: rule.params || {},
        channels: rule.channels?.length
          ? rule.channels.map((c) => ({
              channel: c.channel,
              enabled: c.enabled,
            }))
          : [
              { channel: 'EMAIL', enabled: true },
              { channel: 'IN_APP', enabled: true },
            ],
        recipients: rule.recipients || [],
      });
    } else {
      // Reset form para nueva regla
      setFormData({
        name: '',
        description: '',
        ruleType: '',
        enabled: true,
        scheduleType: 'INTERVAL',
        intervalMinutes: 1440,
        cronExpression: '',
        params: {},
        channels: [
          { channel: 'EMAIL', enabled: true },
          { channel: 'IN_APP', enabled: true },
        ],
        recipients: [],
      });
    }
  }, [rule, show]);

  // Cargar usuarios disponibles y condiciones
  useEffect(() => {
    if (show) {
      loadUsers();
      loadInventoryFields();
      loadConditions();
    }
  }, [show]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getAvailableRecipients();
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadInventoryFields = async () => {
    setInventoryFieldsLoading(true);
    try {
      const data = await getInventoryFields();
      setInventoryFields(data || []);
    } catch (error) {
      console.error('Error loading inventory fields:', error);
    } finally {
      setInventoryFieldsLoading(false);
    }
  };

  const loadConditions = async () => {
    setConditionsLoading(true);
    try {
      const data = await getConditions();
      setConditions(data || []);
    } catch (error) {
      console.error('Error loading conditions:', error);
    } finally {
      setConditionsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      // Si cambia el tipo de regla, limpiar los parámetros para evitar mezclar datos
      if (field === 'ruleType' && value !== prev.ruleType) {
        return { ...prev, [field]: value, params: {} };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleChannelToggle = (channel) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.map((c) =>
        c.channel === channel ? { ...c, enabled: !c.enabled } : c,
      ),
    }));
  };

  const handleAddUserRecipient = (userId, emailRole = 'TO') => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    // Evitar duplicados
    if (
      formData.recipients.some((r) => r.kind === 'USER' && r.userId === userId)
    ) {
      toast.error('Este usuario ya está agregado');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      recipients: [
        ...prev.recipients,
        {
          kind: 'USER',
          userId,
          emailRole,
          _userName: `${user.firstName} ${user.lastName}`,
        },
      ],
    }));
  };

  const handleAddEmailRecipient = (email, emailRole = 'TO') => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Ingresa un email válido');
      return;
    }

    // Evitar duplicados
    if (
      formData.recipients.some((r) => r.kind === 'EMAIL' && r.email === email)
    ) {
      toast.error('Este email ya está agregado');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      recipients: [...prev.recipients, { kind: 'EMAIL', email, emailRole }],
    }));
  };

  const handleRemoveRecipient = (index) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const handleParamChange = (paramKey, value) => {
    setFormData((prev) => ({
      ...prev,
      params: { ...prev.params, [paramKey]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.ruleType) {
      toast.error('Selecciona un tipo de regla');
      return;
    }

    if (!formData.channels.some((c) => c.enabled)) {
      toast.error('Selecciona al menos un canal de notificación');
      return;
    }

    if (formData.recipients.length === 0) {
      toast.error('Agrega al menos un destinatario');
      return;
    }

    // Validar parámetros JSON si es necesario
    const currentRuleType = ruleTypes.find((t) => t.type === formData.ruleType);
    if (currentRuleType?.paramsSchema) {
      for (const [key, config] of Object.entries(
        currentRuleType.paramsSchema,
      )) {
        if (config.type === 'json' && formData.params[key]) {
          const value = formData.params[key];
          if (typeof value === 'string') {
            try {
              JSON.parse(value);
            } catch {
              toast.error(
                `El campo "${config.label || key}" debe ser un JSON válido`,
              );
              return;
            }
          }
        }
      }
    }

    setLoading(true);
    try {
      if (rule) {
        await updateRule(rule.id, formData);
        toast.success('Regla actualizada correctamente');
      } else {
        await createRule(formData);
        toast.success('Regla creada correctamente');
      }
      onClose();
      // Llamar callback de éxito después de cerrar para refrescar datos
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar la regla');
    } finally {
      setLoading(false);
    }
  };

  // Obtener el schema de parámetros del tipo de regla seleccionado
  const selectedRuleType = ruleTypes.find((t) => t.type === formData.ruleType);
  const paramsSchema = selectedRuleType?.paramsSchema || {};

  // Opciones para los SearchableSelect
  const ruleTypeOptions = useMemo(
    () =>
      ruleTypes.map((type) => ({
        value: type.type,
        label: type.name,
        description: type.description,
      })),
    [ruleTypes],
  );

  const userOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
        description: user.email,
        photoUrl: user.photoUrl || null,
        initials:
          `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase(),
      })),
    [users],
  );

  // Render personalizado para opciones de usuario con avatar
  const renderUserOption = (option) => (
    <div className="flex items-center gap-3">
      {option.photoUrl ? (
        <img
          src={FormattedUrlImage(option.photoUrl)}
          alt={option.label}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white">
            {option.initials}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {option.label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {option.description}
        </p>
      </div>
    </div>
  );

  const inventoryFieldOptions = useMemo(
    () =>
      inventoryFields.map((field) => ({
        value: field.value,
        label: field.label,
        description:
          field.type === 'relation'
            ? `Relación → ${field.relationTo}`
            : field.type,
      })),
    [inventoryFields],
  );

  // Opciones para condiciones (del endpoint)
  const conditionOptions = useMemo(() => conditions, [conditions]);

  const intervalOptions = [
    { value: 60, label: 'Cada hora' },
    { value: 360, label: 'Cada 6 horas' },
    { value: 720, label: 'Cada 12 horas' },
    { value: 1440, label: 'Cada día' },
    { value: 4320, label: 'Cada 3 días' },
    { value: 10080, label: 'Cada semana' },
  ];

  const scheduleTypeOptions = [
    { value: 'INTERVAL', label: 'Por intervalo' },
    { value: 'CRON', label: 'Expresión CRON' },
  ];

  // Opciones dinámicas para selects de params
  const getSelectOptions = (config) => {
    return (config.options || []).map((opt) => ({
      value: opt,
      label: opt,
    }));
  };

  // Entidades disponibles para consulta personalizada
  const entityOptions = [
    {
      value: 'inventory',
      label: 'Inventarios',
      description: 'Equipos y activos',
    },
    {
      value: 'purchaseOrder',
      label: 'Órdenes de Compra',
      description: 'OCs del sistema',
    },
    { value: 'invoice', label: 'Facturas', description: 'Facturas asociadas' },
    {
      value: 'custodyRecord',
      label: 'Resguardos',
      description: 'Documentos de custodia',
    },
    { value: 'model', label: 'Modelos', description: 'Catálogo de modelos' },
    {
      value: 'vertical',
      label: 'Verticales',
      description: 'Verticales de negocio',
    },
    {
      value: 'location',
      label: 'Ubicaciones',
      description: 'Ubicaciones de inventario',
    },
  ];

  // Renderizar campo dinámico según el tipo en paramsSchema
  const renderParamField = (key, config) => {
    const value = formData.params[key];

    switch (config.type) {
      case 'number':
        return (
          <TextInput
            id={key}
            type="number"
            value={value ?? config.default ?? ''}
            onChange={(e) =>
              handleParamChange(key, parseInt(e.target.value) || 0)
            }
          />
        );

      case 'string':
        return (
          <TextInput
            id={key}
            value={value ?? config.default ?? ''}
            onChange={(e) => handleParamChange(key, e.target.value)}
            placeholder={config.placeholder}
          />
        );

      case 'boolean':
        return (
          <ToggleSwitch
            checked={value ?? config.default ?? false}
            onChange={(checked) => handleParamChange(key, checked)}
          />
        );

      case 'select':
        // Para entity en CUSTOM_QUERY usar las opciones mejoradas
        if (key === 'entity') {
          return (
            <SearchableSelect
              options={entityOptions}
              value={value ?? config.default ?? ''}
              onChange={(val) => handleParamChange(key, val)}
              placeholder="Seleccionar entidad..."
              searchPlaceholder="Buscar entidad..."
            />
          );
        }
        return (
          <SearchableSelect
            options={getSelectOptions(config)}
            value={value ?? config.default ?? ''}
            onChange={(val) => handleParamChange(key, val)}
            placeholder="Seleccionar..."
            searchPlaceholder="Buscar..."
          />
        );

      case 'multiselect':
        return (
          <SearchableSelect
            multiple
            showSelectAll
            options={getSelectOptions(config)}
            value={value ?? config.default ?? []}
            onChange={(val) => handleParamChange(key, val)}
            placeholder="Seleccionar opciones..."
            searchPlaceholder="Buscar..."
          />
        );

      case 'multiselect-dynamic':
        // Para campos de inventario dinámicos
        if (config.optionsSource === 'inventoryFields') {
          return (
            <SearchableSelect
              multiple
              showSelectAll
              options={inventoryFieldOptions}
              value={value ?? config.default ?? []}
              onChange={(val) => handleParamChange(key, val)}
              placeholder={
                inventoryFieldsLoading
                  ? 'Cargando campos...'
                  : 'Seleccionar campos...'
              }
              searchPlaceholder="Buscar campo o relación..."
              disabled={inventoryFieldsLoading}
            />
          );
        }
        // Para condiciones del catálogo
        if (config.optionsSource === 'conditions') {
          return (
            <SearchableSelect
              multiple
              showSelectAll
              options={conditionOptions}
              value={value ?? config.default ?? []}
              onChange={(val) => handleParamChange(key, val)}
              placeholder={
                conditionsLoading
                  ? 'Cargando condiciones...'
                  : 'Seleccionar condiciones...'
              }
              searchPlaceholder="Buscar condición..."
              disabled={conditionsLoading}
              emptyMessage="No hay condiciones disponibles"
            />
          );
        }
        return null;

      case 'json':
        // Verificar si el JSON es válido
        const isValidJson = (() => {
          if (!value || value === '') return true; // vacío es válido
          if (typeof value === 'object') return true; // ya es objeto
          try {
            JSON.parse(value);
            return true;
          } catch {
            return false;
          }
        })();

        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={key} value={config.label || key} />
              <button
                type="button"
                onClick={() => setShowJsonHelp(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <HiInformationCircle className="w-4 h-4" />
                Ver ejemplos
              </button>
            </div>
            <Textarea
              id={key}
              value={
                typeof value === 'object'
                  ? JSON.stringify(value, null, 2)
                  : (value ?? '')
              }
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleParamChange(key, parsed);
                } catch {
                  // Permitir edición aunque no sea JSON válido aún
                  handleParamChange(key, e.target.value);
                }
              }}
              placeholder='{ "campo": "valor" }'
              rows={4}
              className={`font-mono text-sm ${!isValidJson ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              color={!isValidJson ? 'failure' : undefined}
            />
            {!isValidJson && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <HiExclamationCircle className="w-4 h-4" />
                JSON inválido. Verifica la sintaxis.
              </p>
            )}
            {config.description && isValidJson && (
              <p className="text-xs text-gray-500">{config.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Modal show={show} onClose={onClose} size="xl">
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
          {/* Header fijo */}
          <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600 shrink-0">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {rule ? 'Editar Regla' : 'Nueva Regla de Notificación'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" value="Nombre de la regla *" />
                <TextInput
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Inventarios incompletos"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ruleType" value="Tipo de regla *" />
                <SearchableSelect
                  options={ruleTypeOptions}
                  value={formData.ruleType}
                  onChange={(val) => handleChange('ruleType', val)}
                  placeholder="Seleccionar tipo..."
                  searchPlaceholder="Buscar tipo de regla..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" value="Descripción" />
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripción de la regla..."
                rows={2}
              />
            </div>

            {/* Tipo de regla seleccionado - Info */}
            {selectedRuleType && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  {selectedRuleType.description}
                </p>
              </div>
            )}

            {/* Parámetros dinámicos según el tipo de regla */}
            {Object.keys(paramsSchema).length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Parámetros de la regla</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(paramsSchema).map(([key, config]) => {
                    // Campos que deben ocupar el ancho completo
                    const fullWidthFields = ['json', 'multiselect-dynamic'];
                    const fullWidthKeys = [
                      'missingFields',
                      'conditionName',
                      'filters',
                    ];
                    const isFullWidth =
                      fullWidthFields.includes(config.type) ||
                      fullWidthKeys.includes(key);

                    // Para JSON renderizar en modo especial
                    if (config.type === 'json') {
                      return (
                        <div key={key} className="md:col-span-2">
                          {renderParamField(key, config)}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={key}
                        className={isFullWidth ? 'md:col-span-2' : ''}
                      >
                        <Label htmlFor={key} value={config.label || key} />
                        {renderParamField(key, config)}
                        {config.description && config.type !== 'json' && (
                          <p className="text-xs text-gray-500 mt-1">
                            {config.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Programación */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Programación</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduleType" value="Tipo de programación" />
                  <SearchableSelect
                    options={scheduleTypeOptions}
                    value={formData.scheduleType}
                    onChange={(val) => handleChange('scheduleType', val)}
                    placeholder="Seleccionar..."
                  />
                </div>

                {formData.scheduleType === 'INTERVAL' && (
                  <div>
                    <Label htmlFor="intervalMinutes" value="Intervalo" />
                    <SearchableSelect
                      options={intervalOptions}
                      value={formData.intervalMinutes}
                      onChange={(val) => handleChange('intervalMinutes', val)}
                      placeholder="Seleccionar intervalo..."
                    />
                  </div>
                )}

                {formData.scheduleType === 'CRON' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="cronExpression" value="Expresión CRON" />
                      <button
                        type="button"
                        onClick={() => setShowCronHelp(true)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <HiInformationCircle className="w-4 h-4" />
                        Ayuda
                      </button>
                    </div>
                    <TextInput
                      id="cronExpression"
                      value={formData.cronExpression}
                      onChange={(e) =>
                        handleChange('cronExpression', e.target.value)
                      }
                      placeholder="0 9 * * *"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ej: "0 9 * * *" = Todos los días a las 9:00 AM
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Canales */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Canales de notificación</h4>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={
                      formData.channels.find((c) => c.channel === 'EMAIL')
                        ?.enabled
                    }
                    onChange={() => handleChannelToggle('EMAIL')}
                  />
                  <HiMail className="w-5 h-5 text-blue-500" />
                  <span>Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={
                      formData.channels.find((c) => c.channel === 'IN_APP')
                        ?.enabled
                    }
                    onChange={() => handleChannelToggle('IN_APP')}
                  />
                  <HiBell className="w-5 h-5 text-green-500" />
                  <span>In-App</span>
                </div>
              </div>
            </div>

            {/* Destinatarios */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Destinatarios</h4>

              {/* Agregar usuario */}
              <div className="mb-4">
                <Label value="Agregar usuario" />
                <SearchableSelect
                  options={userOptions}
                  value=""
                  onChange={(val) => {
                    if (val) {
                      handleAddUserRecipient(val, 'TO');
                    }
                  }}
                  placeholder={
                    usersLoading ? 'Cargando...' : 'Seleccionar usuario...'
                  }
                  searchPlaceholder="Buscar usuario..."
                  disabled={usersLoading}
                  renderOption={renderUserOption}
                />
              </div>

              {/* Agregar email externo */}
              <div className="flex items-end gap-2 mb-4">
                <div className="flex-1">
                  <Label value="Agregar email externo" />
                  <TextInput
                    type="email"
                    id="externalEmail"
                    placeholder="correo@ejemplo.com"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEmailRecipient(e.target.value, 'TO');
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <Button
                  color="light"
                  size="sm"
                  onClick={() => {
                    const input = document.getElementById('externalEmail');
                    handleAddEmailRecipient(input.value, 'TO');
                    input.value = '';
                  }}
                >
                  <HiPlus className="w-4 h-4" />
                </Button>
              </div>

              {/* Lista de destinatarios */}
              {formData.recipients.length > 0 && (
                <div className="space-y-2">
                  {formData.recipients.map((recipient, index) => {
                    const user =
                      recipient.kind === 'USER'
                        ? users.find((u) => u.id === recipient.userId)
                        : null;
                    const photoUrl = FormattedUrlImage(user?.photoUrl) || null;
                    const initials = user
                      ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
                      : '';
                    const displayName =
                      recipient.kind === 'USER'
                        ? recipient._userName ||
                          (user
                            ? `${user.firstName} ${user.lastName}`
                            : user?.email)
                        : recipient.email;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {recipient.kind === 'USER' ? (
                            photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={displayName}
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <span className="text-[10px] font-semibold text-white">
                                  {initials || <HiUser className="w-3 h-3" />}
                                </span>
                              </div>
                            )
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                              <HiAtSymbol className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <span className="text-sm text-gray-700 dark:text-gray-200">
                            {displayName}
                          </span>
                          <Badge color="gray" size="xs">
                            {recipient.emailRole}
                          </Badge>
                        </div>
                        <Button
                          color="failure"
                          size="xs"
                          onClick={() => handleRemoveRecipient(index)}
                        >
                          <HiTrash className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {formData.recipients.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay destinatarios agregados
                </p>
              )}
            </div>

            {/* Estado */}
            <div className="flex items-center gap-2">
              <ToggleSwitch
                checked={formData.enabled}
                onChange={(checked) => handleChange('enabled', checked)}
              />
              <span>Regla activa</span>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 rounded-b dark:border-gray-600 shrink-0">
            <Button color="gray" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button color="blue" type="submit" disabled={loading}>
              {loading && <Spinner size="sm" className="mr-2" />}
              {rule ? 'Guardar Cambios' : 'Crear Regla'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modales de ayuda */}
      <CronHelpModal
        show={showCronHelp}
        onClose={() => setShowCronHelp(false)}
      />
      <JsonFilterHelpModal
        show={showJsonHelp}
        onClose={() => setShowJsonHelp(false)}
        entity={formData.params?.entity || 'inventory'}
      />
    </>
  );
};

export default NotificationRuleForm;
