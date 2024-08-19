import { Checkbox, Table as T } from 'flowbite-react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import classNames from 'classnames';

const Table = ({ columns, children, sortBy, selectAll }) => {
  return (
    <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <T hoverable>
          <T.Head className="text-nowrap">
            {columns?.map((col) => (
              <T.HeadCell
                key={col?.id}
                scope="col"
                className={`${col?.order || col?.id === 'checkbox' ? '' : 'pointer-events-none'} p-4 bg-neutral-300 ${col?.id !== 'checkbox' ? 'cursor-pointer hover:bg-orange-400 hover:text-white transition-colors ease-in-out duration-100' : ''} ${col?.classes}`}
                onClick={col?.id !== 'checkbox' ? () => sortBy(col.id) : null}
              >
                <span
                  className={classNames(
                    'flex flew-row gap-2 items-center',
                    col?.id === 'checkbox' ? 'justify-center' : 'justify-start',
                  )}
                >
                  {col.value}
                  {col?.order && (
                    <div className="cursor-pointer disabled">
                      {col.order === 'desc' ? <FaArrowDown /> : <FaArrowUp />}
                    </div>
                  )}
                  {col?.id === 'checkbox' && <Checkbox onChange={selectAll} />}
                </span>
              </T.HeadCell>
            ))}
          </T.Head>
          <T.Body>{children}</T.Body>
        </T>
      </div>
    </div>
  );
};

export default Table;
