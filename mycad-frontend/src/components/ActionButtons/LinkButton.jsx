import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';

const LinkButton = ({ route, color, icon: Icon, label }) => {
  return (
    <Link to={route}>
      <Button outline color={color}>
        <Icon size={18} className="mr-2 mt-0.5" />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

export default LinkButton;
