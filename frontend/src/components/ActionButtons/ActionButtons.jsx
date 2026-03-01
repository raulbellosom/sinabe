// src/components/ActionButtons/ActionButtons.jsx
import {
  CheckCircle,
  Pencil,
  Eye,
  Plus,
  Trash2,
  XCircle,
  Pin,
  PinOff,
} from 'lucide-react';
import LinkButton from './LinkButton';
import { getButtonClassNames } from '../../utils/getButtonClassNames';

const ActionButtons = ({
  // Named shorthand props (backward-compatible)
  onShow,
  onEdit,
  onRemove,
  onCreate,
  onCancel,
  onTogglePin,
  onSave,
  labelShow,
  labelEdit,
  labelRemove,
  labelCreate,
  labelCancel,
  labelPin,
  labelSave,
  iconSave,
  colorSave,
  isPinMode = false,
  disabledSave = false,
  // Free-form extra actions (preferred API)
  extraActions = [],
}) => {
  // Named shorthand actions come first so save/primary is always leftmost
  const namedActions = [
    {
      label: labelSave || 'Guardar',
      action: onSave,
      color: colorSave || 'blue',
      icon: iconSave || CheckCircle,
      disabled: disabledSave,
    },
    {
      label: labelShow || 'Ver',
      action: onShow,
      color: 'cyan',
      icon: Eye,
    },
    {
      label: labelEdit || 'Editar',
      action: onEdit,
      color: 'yellow',
      icon: Pencil,
    },
    {
      label: labelRemove || 'Eliminar',
      action: onRemove,
      color: 'red',
      icon: Trash2,
    },
    {
      label: labelCreate || 'Nuevo',
      action: onCreate,
      color: 'indigo',
      icon: Plus,
    },
    {
      label: labelCancel || 'Cancelar',
      action: onCancel,
      color: 'red',
      icon: XCircle,
    },
    {
      label: isPinMode
        ? labelPin || 'Desactivar Pin'
        : labelPin || 'Activar Pin',
      action: onTogglePin,
      color: isPinMode ? 'green' : 'blue',
      icon: isPinMode ? Pin : PinOff,
    },
  ];

  const visibleActions = [
    ...namedActions.filter((a) => a.action),
    ...extraActions.filter((a) => a.action || a.href),
  ];

  if (visibleActions.length === 0) return null;

  return visibleActions.map((action, index) => {
    const Icon = action.icon;
    const label = action.label;
    const disabled = action.disabled || false;

    if (action.href) {
      return (
        <LinkButton
          key={index}
          route={action.href}
          color={action.color}
          icon={Icon}
          label={label}
          outline={action.outline}
          filled={action.filled}
          disabled={disabled}
          className={action.className}
        />
      );
    }

    return (
      <button
        key={index}
        type={action.type || 'button'}
        onClick={action.action}
        disabled={disabled}
        className={getButtonClassNames(
          action.color,
          action.filled,
          disabled,
          action.className,
        )}
      >
        {Icon && <Icon size={16} />}
        {label && <span className="ml-1.5">{label}</span>}
      </button>
    );
  });
};

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
