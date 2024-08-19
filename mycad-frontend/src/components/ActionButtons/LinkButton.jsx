import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';

const LinkButton = ({ route, color, icon: Icon, label, outline = true }) => {
  return (
    <Link className="bg-transparent" to={route}>
      <Button type="button" color={color} outline={outline}>
        <span>
          <Icon size={18} className="mr-2 mt-0.5" />
        </span>
        <span className="md:hidden lg:block">{label}</span>
      </Button>
    </Link>
  );
};

export default LinkButton;
