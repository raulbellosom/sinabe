import classNames from 'classnames';

const TableFooter = ({
  index,
  totalItems,
  goOnPrevPage,
  goOnNextPage,
  handleSelectChange,
  valuesPerPage,
  currentPage,
}) => {
  // console.log('totalItems ', totalItems);
  // console.log('index ', index);
  // console.log('currentPageNumber ', currentPage);
  const activePagClass = "flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white";
  const pagClass = "flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";
  const disablePagClass = "pointer-events-none opacity-60 flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";
  return (
    <nav
      className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
      aria-label="Table navigation"
    >
      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
        Mostrando&nbsp;
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalItems === index
            ? totalItems
            : `${index} - ${valuesPerPage + index - 1 >= totalItems ? totalItems : valuesPerPage + index - 1}`}
        </span>
        &nbsp;de&nbsp;
        <span className="font-semibold text-gray-900 dark:text-white">
          {totalItems}
        </span>
        &nbsp;resultados
      </span>
      <ul className="inline-flex items-stretch -space-x-px">
        <li
          key="prev"
          onClick={goOnPrevPage}
          className={index === 1 ? 'pointer-events-none opacity-60' : ''}
        >
          <a
            href="#"
            className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </li>

        {Array.from(Array(Math.round(totalItems / valuesPerPage)))
          .map((e, i) => i + 1)
          .map((val) => {
            return (
              <li key={val} onClick={() => handleSelectChange(val)}>
              {
                ( currentPage >=4 && val === currentPage && currentPage !== Math.round(totalItems / valuesPerPage)) ?? (
                    <a
                      href="#"
                      className="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                    >
                      {currentPage}
                    </a>
                ) 
              }
                {val === 1 ? (
                    <a
                      className={classNames(
                        val === currentPage
                          ? activePagClass
                          : pagClass,
                      )}
                    >
                      {val}
                    </a>
                ) 
                 : val < 4 ? (
                    <a
                      className={classNames(
                        val === currentPage
                          ? activePagClass
                          : pagClass,
                      )}
                    >
                      {val}
                    </a>
                )  : Math.round(totalItems / valuesPerPage) - 1 === val ? (
                    <a
                      className={disablePagClass}
                    >
                      ...
                    </a>
                )
                : val == Math.round(totalItems / valuesPerPage) ? (
                    <a
                      className={disablePagClass}
                    >
                      {Math.round(totalItems / valuesPerPage)}
                    </a>
                ) : (
                    <></>
                )}
              </li>
            );
          })}


        <li
          key={totalItems}
          onClick={goOnNextPage}
          className={
            (valuesPerPage + index - 1) >= totalItems ? 'pointer-events-none opacity-60' : ''
          }
        >
          <a
            className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span className="sr-only">Next</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default TableFooter;
