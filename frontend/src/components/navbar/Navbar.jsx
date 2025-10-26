import React from 'react';
import { Button, Tooltip } from 'flowbite-react';
import { HiOutlineMenuAlt1 } from 'react-icons/hi';
import Logo from '../../assets/logo/sinabe_icon.png';
import ImageViewer from '../ImageViewer/ImageViewer';
import classNames from 'classnames';
import GlobalInventorySearch from '../InventoryComponents/GlobalInventorySearch';
import { Link, useLocation } from 'react-router-dom';
import { AiFillPlusCircle } from 'react-icons/ai';
import { AIAgentButton } from '../AIAgent';

const Navbar = ({
  collapsed,
  setCollapsed = () => {},
  toggled,
  setToggled = () => {},
  broken,
  user,
}) => {
  const { firstName, lastName, role, photo } = user;
  const name = `${firstName} ${lastName}`;
  const userRole = role?.name;

  const location = useLocation();
  const shouldHideNavbar = location.pathname.includes('/inventories');

  return (
    <div className="flex justify-between items-center bg-white shadow-md p-2 w-full h-16 absolute top-0 left-0 z-50">
      <Button
        onClick={broken ? setToggled : setCollapsed}
        color="light"
        style={{ borderStyle: 'none' }}
        className="h-8 w-8 flex items-center justify-center rounded-md transition-colors duration-100 ease-in-out text-sinabe-primary hover:text-purple-600"
      >
        <HiOutlineMenuAlt1 className="text-2xl cursor-pointer" />
      </Button>
      {/* {!shouldHideNavbar && (
        <div className="flex items-center gap-4 w-full px-4">
          <GlobalInventorySearch />
        </div>
      )} */}
      <div className="flex items-center gap-2 w-full px-4">
        <GlobalInventorySearch />
        <AIAgentButton />
        <Tooltip content="Crear nuevo inventario" placement="bottom">
          <Link to="/inventories/create">
            <AiFillPlusCircle className="text-4xl text-purple-500 hover:text-sinabe-primary cursor-pointer" />
          </Link>
        </Tooltip>
      </div>

      {!broken && (
        <div className="hidden w-full md:flex justify-between items-center px-4">
          <div>
            {/* get date */}
            {/* <p className="text-sm font-semibold text-sinabe-primary truncate">
              {new Date().toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p> */}
          </div>
          <div
            className={classNames(
              'whitespace-nowrap overflow-hidden flex justify-start gap-4 items-center',
            )}
          >
            <div className="flex justify-center items-center h-10 w-10 min-w-10 min-h-10 overflow-hidden rounded-full bg-stone-400">
              <ImageViewer
                images={photo ? [photo] : ['https://via.placeholder.com/150']}
                imageStyles={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div className={'truncate whitespace-nowrap text-nowrap'}>
              <h2
                className={classNames(
                  'text-sm font-bold text-sinabe-primary w-full truncate',
                )}
              >
                {name}
              </h2>
              <p
                className={classNames(
                  'text-neutral-400 w-full truncate text-xs',
                )}
              >
                {userRole}
              </p>
            </div>
          </div>
        </div>
      )}
      <img src={Logo} alt="Logo" className="h-7 block md:hidden" />
    </div>
  );
};

export default Navbar;
