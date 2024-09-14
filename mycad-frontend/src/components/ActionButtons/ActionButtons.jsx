import React, { forwardRef } from 'react';
import { FaEdit, FaEye, FaPlus, FaTrash } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { useAuthContext } from '../../context/AuthContext';
import LinkButton from './LinkButton';
import { getButtonClassNames } from '../../utils/getButtonClassNames';

const ActionButtons = forwardRef(
  (
    {
      onShow,
      onEdit,
      onRemove,
      onCreate,
      onCancel,
      labelShow,
      labelEdit,
      labelRemove,
      labelCreate,
      labelCancel,
      extraActions = [],
    },
    ref,
  ) => {
    const { user } = useAuthContext();
    const permisions = {
      show: [1, 2, 3],
      edit: [1, 2],
      remove: [1],
      create: [1, 2],
      extraActions: [1, 2, 3],
    };

    const actions = [
      ...extraActions.map((action) => ({
        ...action,
        permission: permisions.extraActions.includes(user.roleId),
      })),
      {
        label: labelShow || 'Ver',
        action: onShow,
        color: 'cyan',
        icon: FaEye,
        permission: permisions.show.includes(user.roleId),
        disabled: false,
      },
      {
        label: labelEdit || 'Editar',
        action: onEdit,
        color: 'yellow',
        icon: FaEdit,
        permission: permisions.edit.includes(user.roleId),
        disabled: false,
      },
      {
        label: labelRemove || 'Eliminar',
        action: onRemove,
        color: 'red',
        icon: FaTrash,
        permission: permisions.remove.includes(user.roleId),
        disabled: false,
      },
      {
        label: labelCreate || 'Nuevo',
        action: onCreate,
        color: 'indigo',
        icon: FaPlus,
        permission: permisions.create.includes(user.roleId),
        disabled: false,
      },
      {
        label: labelCancel || 'Cancelar',
        action: onCancel,
        color: 'red',
        icon: MdCancel,
        permission: permisions.create.includes(user.roleId),
        disabled: false,
      },
    ];

    const filteredActions = actions.filter(
      (action) =>
        (action.action && action.permission) ||
        (action.href && action.permission),
    );

    if (filteredActions.length === 0) {
      return null;
    }

    return filteredActions.map((action, index) =>
      action?.href ? (
        <LinkButton
          key={index}
          route={action.href}
          color={action.color}
          icon={action.icon}
          label={action.label}
          outline={action?.outline}
          filled={action?.filled}
          disabled={action?.disabled || false}
          className={action?.className}
        />
      ) : (
        <button
          key={index}
          ref={ref}
          onClick={action.action}
          className={getButtonClassNames(
            action?.color,
            action?.filled,
            action?.disabled,
            action?.className,
          )}
          outline={action?.outline}
          type={action?.type || 'button'}
          disabled={action?.disabled || false}
        >
          <i>{action.icon && <action.icon size={18} />}</i>
          <span className={`${action?.label?.length > 0 && 'ml-2'}`}>
            {action.label}
          </span>
        </button>
      ),
    );
  },
);

export default ActionButtons;
