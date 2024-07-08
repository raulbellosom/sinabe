import React from 'react';
import { Button } from 'flowbite-react';
import { HiOutlineMenuAlt1 } from 'react-icons/hi';

const Navbar = ({
  collapsed,
  setCollapsed = () => {},
  toggled,
  setToggled = () => {},
  broken,
}) => {
  return (
    <div className="flex justify-between items-center bg-white shadow-md p-2 w-full h-16">
      <Button
        onClick={broken ? setToggled : setCollapsed}
        color="light"
        style={{ borderStyle: 'none' }}
        className="h-8 w-8 flex items-center justify-center"
      >
        <HiOutlineMenuAlt1 className="text-2xl cursor-pointer" />
      </Button>
    </div>
  );
};

export default Navbar;
