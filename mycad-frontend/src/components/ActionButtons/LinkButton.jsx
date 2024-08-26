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
}) => {
  return (
    <Link className={getButtonClassNames(color, filled)} to={route}>
      <i>
        <Icon size={18} />
      </i>
      <span>{label}</span>
    </Link>
  );
};

export default LinkButton;
