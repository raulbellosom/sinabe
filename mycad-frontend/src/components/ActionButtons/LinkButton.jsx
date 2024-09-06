import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { getButtonClassNames } from '../../utils/getButtonClassNames';

const LinkButton = ({
  route,
  color,
  filled,
  icon: Icon,
  label,
  outline = false,
  disabled = false,
}) => {
  return (
    <Link
      className={getButtonClassNames(color, filled, disabled)}
      to={!disabled ? route : null}
    >
      <i>
        <Icon size={18} />
      </i>
      <span className="ml-2">{label}</span>
    </Link>
  );
};

export default LinkButton;
