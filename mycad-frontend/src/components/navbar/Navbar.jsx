import React from 'react';
import { Button } from 'flowbite-react';
import { HiOutlineMenuAlt1 } from 'react-icons/hi';

const Navbar = ({ collapsed, setCollapsed = () => {} }) => {
  return (
    <div className="flex justify-between items-center bg-white shadow-md p-4 y-2 w-full h-16">
      {/* <Button onClick={() => setCollapsed(!collapsed)} color="light">
        <HiOutlineMenuAlt1 className="text-2xl cursor-pointer" />
      </Button> */}
    </div>
  );
};

export default Navbar;
