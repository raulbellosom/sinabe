import { TextInput } from 'flowbite-react';
import React from 'react';
import { FaSearch } from 'react-icons/fa';

const TableActions = ({ handleSearchTerm }) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between">
      <div className="w-full md:w-1/2">
        <form className="flex items-center">
          <div className="relative w-full">
            <TextInput
              icon={FaSearch}
              className="w-full mb-2"
              placeholder="Buscar vehículo"
              onChange={handleSearchTerm}
              type="search"
            />
          </div>
        </form>
      </div>
      <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
        {/* <button type="button" id="createProductButton" data-modal-toggle="createProductModal" className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
                    <svg className="h-3.5 w-3.5 mr-1.5 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                    </svg>
                    Add product
                </button> */}
        <button
          id="filterDropdownButton"
          data-dropdown-toggle="filterDropdown"
          className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="h-4 w-4 mr-1.5 -ml-1 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
          Filtros
          <svg
            className="-mr-1 ml-1.5 w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            />
          </svg>
        </button>
        <div
          id="filterDropdown"
          className="z-10 hidden px-3 pt-1 bg-white rounded-lg shadow w-80 dark:bg-gray-700 right-0"
        >
          <div className="flex items-center justify-between pt-2">
            <h6 className="text-sm font-medium text-black dark:text-white">
              Filters
            </h6>
            <div className="flex items-center space-x-3">
              <a
                href="#"
                className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline"
              >
                Save view
              </a>
              <a
                href="#"
                className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline"
              >
                Clear all
              </a>
            </div>
          </div>
          <div className="pt-3 pb-2">
            <label htmlFor="input-group-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="input-group-search"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Search keywords..."
              />
            </div>
          </div>
          <div
            id="accordion-flush"
            data-accordion="collapse"
            data-active-classes="text-black dark:text-white"
            data-inactive-classes="text-gray-500 dark:text-gray-400"
          >
            {/* Category */}
            <h2 id="category-heading">
              <button
                type="button"
                className="flex items-center justify-between w-full py-2 px-1.5 text-sm font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                data-accordion-target="#category-body"
                aria-expanded="true"
                aria-controls="category-body"
              >
                <span>Category</span>
                <svg
                  aria-hidden="true"
                  data-accordion-icon=""
                  className="w-5 h-5 rotate-180 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  />
                </svg>
              </button>
            </h2>
            <div
              id="category-body"
              className="hidden"
              aria-labelledby="category-heading"
            >
              <div className="py-2 font-light border-b border-gray-200 dark:border-gray-600">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <input
                      id="apple"
                      type="checkbox"
                      value=""
                      className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label
                      htmlFor="apple"
                      className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Apple (56)
                    </label>
                  </li>
                  <a
                    href="#"
                    className="flex items-center text-sm font-medium text-primary-600 dark:text-primary-500 hover:underline"
                  >
                    View all
                  </a>
                </ul>
              </div>
            </div>
            {/* Price */}
            <h2 id="price-heading">
              <button
                type="button"
                className="flex items-center justify-between w-full py-2 px-1.5 text-sm font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                data-accordion-target="#price-body"
                aria-expanded="true"
                aria-controls="price-body"
              >
                <span>Price</span>
                <svg
                  aria-hidden="true"
                  data-accordion-icon=""
                  className="w-5 h-5 rotate-180 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  />
                </svg>
              </button>
            </h2>
            <div
              id="price-body"
              className="hidden"
              aria-labelledby="price-heading"
            >
              {/* <div className="flex items-center py-2 space-x-3 font-light border-b border-gray-200 dark:border-gray-600"><select id="price-from" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"><option disabled="" selected>From</option><option>$500</option><option>$2500</option><option>$5000</option></select><select id="price-to" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"><option disabled="" selected="">To</option><option>$500</option><option>$2500</option><option>$5000</option></select></div> */}
            </div>
            {/* Worldwide Shipping */}
            <h2 id="worldwide-shipping-heading">
              <button
                type="button"
                className="flex items-center justify-between w-full py-2 px-1.5 text-sm font-medium text-left text-gray-500 border-b border-gray-200 dark:border-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                data-accordion-target="#worldwide-shipping-body"
                aria-expanded="true"
                aria-controls="worldwide-shipping-body"
              >
                <span>Worldwide Shipping</span>
                <svg
                  aria-hidden="true"
                  data-accordion-icon=""
                  className="w-5 h-5 rotate-180 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  />
                </svg>
              </button>
            </h2>
            <div
              id="worldwide-shipping-body"
              className="hidden"
              aria-labelledby="worldwide-shipping-heading"
            >
              <div className="py-2 space-y-2 font-light border-b border-gray-200 dark:border-gray-600">
                <label className="relative flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    name="shipping"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    North America
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="flex items-center space-x-3 w-full md:w-auto">
                    <button id="actionsDropdownButton" data-dropdown-toggle="actionsDropdown" className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
                        Actions
                        <svg className="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path clipRule="evenodd" fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </button>
                    <div id="actionsDropdown" className="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                        <ul className="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="actionsDropdownButton">
                            <li>
                                <a href="#" className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mass Edit</a>
                            </li>
                        </ul>
                        <div className="py-1">
                            <a href="#" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete all</a>
                        </div>
                    </div>
                </div> */}
      </div>
    </div>
  );
};

export default React.memo(TableActions);
