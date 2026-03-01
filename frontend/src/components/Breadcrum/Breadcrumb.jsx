
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import {
  ArrowLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
const Breadcrumbs = ({ breadcrumbs = [] }) => {
  return (
    <div className="flex justify-between gap-2 pb-4">
      <div className="group flex items-start ">
        <Link
          to="/"
          className="text-neutral-700 hover:text-indigo-900 cursor-pointer p-0 m-0 group flex items-center"
        >
          <Home className="h-4 w-4 p-0" />
          <span className="text-sm font-semibold">&nbsp;</span>
        </Link>
        {breadcrumbs &&
          breadcrumbs?.map((route, index) => (
            <span className="group flex items-center" key={index}>
              <span>
                <ChevronRight className="mx-1 h-4 w-4 text-gray-400 md:mx-2" />{' '}
              </span>
              <Link
                to={route?.href}
                className={classNames(
                  'flex items-center text-sm font-medium',
                  route?.href
                    ? 'text-gray-700 hover:text-indigo-900 dark:text-gray-400 dark:hover:text-white'
                    : 'cursor-default text-gray-500',
                  index === breadcrumbs?.length - 1 &&
                    'pointer-events-none opacity-60',
                )}
              >
                {route.icon && <route.icon className="mr-2 h-3.5 w-3.5" />}
                {route.label}
              </Link>
            </span>
          ))}
      </div>
      <div className="flex items-center">
        <button
          onClick={() => {
            window.history.back();
          }}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          Regresar
        </button>
      </div>
    </div>
  );
};

export default Breadcrumbs;
