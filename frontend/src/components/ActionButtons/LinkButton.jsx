import { Link } from 'react-router-dom';
import { getButtonClassNames } from '../../utils/getButtonClassNames';

const LinkButton = ({
  route,
  color,
  filled,
  outline,
  icon: Icon,
  label,
  disabled = false,
  className,
}) => {
  return (
    <Link
      className={getButtonClassNames(
        color,
        filled ?? !outline,
        disabled,
        className,
      )}
      to={!disabled ? route : '#'}
      aria-disabled={disabled}
    >
      {Icon && <Icon size={16} />}
      {label && <span className="ml-1.5">{label}</span>}
    </Link>
  );
};

export default LinkButton;
