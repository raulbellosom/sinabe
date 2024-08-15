import { Button } from 'flowbite-react';
import classNames from 'classnames';
import { FaEdit, FaEye, FaPlus, FaTrash } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { useAuthContext } from '../../context/AuthContext';

const ActionButtons = ({
  onShow,
  onEdit,
  onRemove,
  onCreate,
  position,
  onCancel,
  labelShow,
  labelEdit,
  labelRemove,
  labelCreate,
  labelCancel,
  extraActions = [],
}) => {
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
    },
    {
      label: labelEdit || 'Editar',
      action: onEdit,
      color: 'yellow',
      icon: FaEdit,
      permission: permisions.edit.includes(user.roleId),
    },
    {
      label: labelRemove || 'Eliminar',
      action: onRemove,
      color: 'red',
      icon: FaTrash,
      permission: permisions.remove.includes(user.roleId),
    },
    {
      label: labelCreate || 'Nuevo',
      action: onCreate,
      color: 'indigo',
      icon: FaPlus,
      permission: permisions.create.includes(user.roleId),
    },
    {
      label: labelCancel || 'Cancelar',
      action: onCancel,
      color: 'red',
      icon: MdCancel,
      permission: permisions.create.includes(user.roleId),
    },
  ];

  const filteredActions = actions.filter(
    (action) => action.action && action.permission,
  );

  if (filteredActions.length === 0) {
    return null;
  }

  let positionClass = '';

  switch (position) {
    case 'left':
      positionClass = 'justify-start';
      break;
    case 'center':
      positionClass = 'justify-center';
      break;
    case 'right':
      positionClass = 'justify-end';
      break;
    default:
      positionClass = 'justify-end';
      break;
  }

  return (
    <div
      className={classNames(
        'w-fit flex justify-center md:justify-end items-center gap-2 rounded-md border-none md:p-0',
        positionClass,
      )}
    >
      {filteredActions.map((action, index) => (
        <Button
          key={index}
          onClick={action.action}
          outline
          color={action.color}
          className="p-0 m-0"
        >
          {action.icon && <action.icon size={18} className="mr-2 mt-0.5" />}
          <span className="sm:hidden md:block">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;
