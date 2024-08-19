import { Checkbox, Table as T } from 'flowbite-react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

const Table = ({ columns, children, sortBy }) => {
  return (
    <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <T hoverable>
          <T.Head className="text-nowrap">
            {columns?.map((col) => (
              <T.HeadCell
                key={col?.id}
                scope="col"
                className={`${col?.order ? '': 'pointer-events-none'} p-4 bg-neutral-300 cursor-pointer hover:bg-orange-400 hover:text-white transition-colors ease-in-out duration-100 ${col?.classes}`}
                onClick={() => sortBy(col.id)}
              >
                <span className="flex flew-row gap-2 items-center justify-start">
                  {col.value}
                  {col?.order && (
                    <div className="cursor-pointer disabled:">
                      {col.order === 'desc' ? <FaArrowDown /> : <FaArrowUp />}
                    </div>
                  )}
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
