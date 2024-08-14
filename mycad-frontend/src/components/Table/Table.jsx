import { Checkbox, Table as T } from 'flowbite-react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

const Table = ({ columns, children, sortBy }) => {
  return (
    <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <T hoverable>
          <T.Head className="">
            {columns?.map((col) => (
              <T.HeadCell
                key={col?.id}
                scope="col"
                className={`p-4 ${col?.classes}`}
                onClick={() => sortBy(col.id)}
              >
                <span className="flex flew-row justify-between">
                  {col.value}
                  {col?.order && (
                    <div className='cursor-pointer'>{col.order === 'desc' ? <FaArrowDown /> : <FaArrowUp />}</ div>
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
