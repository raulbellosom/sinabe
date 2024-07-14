import { Button } from 'flowbite-react';
import classNames from 'classnames';
import { FaEdit, FaEye, FaPlus, FaTrash } from 'react-icons/fa';

const ActionButtons = ({
  userRole,
  onShow,
  onEdit,
  onRemove,
  onCreate,
  position,
}) => {
  const permisions = {
    show: [1, 2, 3],
    edit: [1, 2],
    remove: [1],
    create: [1, 2, 3],
  };

  const actions = [
    {
      label: 'Ver',
      action: onShow,
      color: 'cyan',
      icon: FaEye,
      permission: permisions.show.includes(userRole),
    },
    {
      label: 'Editar',
      action: onEdit,
      color: 'yellow',
      icon: FaEdit,
      permission: permisions.edit.includes(userRole),
    },
    {
      label: 'Eliminar',
      action: onRemove,
      color: 'red',
      icon: FaTrash,
      permission: permisions.remove.includes(userRole),
    },
    {
      label: 'Nuevo',
      action: onCreate,
      color: 'indigo',
      icon: FaPlus,
      permission: permisions.create.includes(userRole),
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
        'w-full flex flex-wrap md:flex-row justify-center md:justify-end items-center gap-2',
        positionClass,
      )}
    >
      {filteredActions.map((action, index) => (
        <Button
          key={index}
          onClick={action.action}
          outline
          color={action.color}
        >
          {action.icon && <action.icon size={18} className="mr-2" />}
          <span className="md:hidden lg:block">{action.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;
