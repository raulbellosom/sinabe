import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';

const LinkButton = ({ route, color, icon: Icon, label, outline = true }) => {
  return (
    <Link to={route}>
      <Button type="button" outline={outline} color={color}>
        <Icon size={18} className="mr-2 mt-0.5" />
        <span className="sm:hidden md:block">{label}</span>
      </Button>
    </Link>
  );
};

export default LinkButton;
