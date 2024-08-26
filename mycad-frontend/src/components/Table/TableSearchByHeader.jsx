import React, { useState } from 'react';
import ActionButtons from '../ActionButtons/ActionButtons';
import { RiMenuSearchLine } from 'react-icons/ri';
import ModalForm from '../Modals/ModalForm';
import { Button, Label, Select, TextInput, Tooltip } from 'flowbite-react';
import { IoIosArrowForward } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import { FaTrashAlt } from 'react-icons/fa';

const criteria = [
  { value: 'equals', label: 'Es igual a' },
  { value: 'contains', label: 'Contiene' },
  { value: 'different', label: 'Diferente' },
  { value: 'greater', label: 'Es Mayor que' },
  { value: 'less', label: 'Es Menor que' },
];

const TableSearchByHeader = ({
  headers,
  currentFilters,
  setCurrentFilters,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('');
  const [searchHeader, setSearchHeader] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleSearch = () => {
    if (!searchHeader || !searchTerm || !searchCriteria) {
      setErrors({
        searchHeader: !searchHeader,
        searchTerm: !searchTerm,
        searchCriteria: !searchCriteria,
      });
      setTouched({
        searchHeader: true,
        searchTerm: true,
        searchCriteria: true,
      });
      return;
    }

    const filter = {
      searchHeader,
      searchTerm,
      searchCriteria,
    };
    setCurrentFilters([...currentFilters, filter]);
    setSearchTerm('');
    setSearchHeader('');
    setSearchCriteria('');
    setIsModalOpen(false);
    setErrors({});
    setTouched({});
  };

  const handleBlur = (field, value) => {
    setTouched((prevTouched) => ({
      ...prevTouched,
      [field]: true,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: !value,
    }));
  };

  const handleChange = (field, value) => {
    const updatedErrors = {
      ...errors,
      [field]: !value,
    };

    if (!value) {
      setTouched((prevTouched) => ({
        ...prevTouched,
        [field]: true,
      }));
    }

    setErrors(updatedErrors);

    switch (field) {
      case 'searchHeader':
        setSearchHeader(value);
        break;
      case 'searchTerm':
        setSearchTerm(value);
        break;
      case 'searchCriteria':
        setSearchCriteria(value);
        break;
      default:
        break;
    }
  };

  const getErrorColor = (field) => {
    if (!touched[field]) return undefined;
    return errors[field] ? 'failure' : 'gray';
  };

  const handleCloseModal = () => {
    setSearchTerm('');
    setSearchHeader('');
    setSearchCriteria('');
    setIsModalOpen(false);
    setErrors({});
    setTouched({});
  };

  const cleanFilters = () => {
    setCurrentFilters([]);
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <Tooltip content="Agregar criterio de busqueda" position="top">
          <ActionButtons
            extraActions={[
              {
                label: 'Columnas',
                action: () => setIsModalOpen(true),
                color: 'orange',
                icon: RiMenuSearchLine,
              },
            ]}
          />
        </Tooltip>
        {currentFilters.length > 0 && (
          <div className="flex gap-2">
            {currentFilters.map((filter, index) => (
              <div
                className="text-nowrap text-blue-600 bg-blue-100 hover:bg-red-100 hover:text-red-600 cursor-pointer p-2 rounded-lg flex gap-2 items-center"
                key={index}
                onClick={() =>
                  setCurrentFilters(
                    currentFilters.filter((item) => item !== filter),
                  )
                }
              >
                <strong>
                  {
                    headers.find((item) => item?.id === filter.searchHeader)
                      ?.value
                  }
                </strong>{' '}
                {
                  criteria.find((item) => item?.value === filter.searchCriteria)
                    ?.label
                }{' '}
                <strong>{filter.searchTerm}</strong>
                <i>
                  <MdClose size={18} />
                </i>
              </div>
            ))}
            <Tooltip content="Limpiar criterios de busqueda" position="top">
              <Button outline color="red" onClick={cleanFilters}>
                <FaTrashAlt size={18} />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
      {isModalOpen && (
        <ModalForm
          title={'Busqueda por columnas'}
          isOpenModal={isModalOpen}
          onClose={() => handleCloseModal()}
          size={'4xl'}
          position="center"
        >
          <div className="rounded-md grid grid-cols-3 gap-4">
            <div className="col-span-3 md:col-span-1 flex gap-2 flex-col justify-start">
              <Label
                color={getErrorColor('searchHeader')}
                htmlFor="searchHeader"
              >
                Buscar en
              </Label>
              <Select
                onChange={(e) => handleChange('searchHeader', e.target.value)}
                required
                color={getErrorColor('searchHeader')}
                value={searchHeader}
                onBlur={() => handleBlur('searchHeader', searchHeader)}
              >
                <option disabled value="" />
                {headers.map((item) =>
                  !item.value || item.id === 'images' ? null : (
                    <option
                      key={item.id}
                      value={item.id}
                      className="px-4 py-2 hover:bg-stone-100 cursor-pointer text-blue-500 border-b border-gray-200"
                    >
                      {item.value}
                    </option>
                  ),
                )}
              </Select>
            </div>
            <div className="col-span-3 md:col-span-1 flex gap-2 flex-col justify-start">
              <Label
                color={getErrorColor('searchCriteria')}
                htmlFor="searchCriteria"
              >
                Criterio de búsqueda
              </Label>
              <Select
                id="searchCriteria"
                onChange={(e) => handleChange('searchCriteria', e.target.value)}
                value={searchCriteria}
                color={getErrorColor('searchCriteria')}
                onBlur={() => handleBlur('searchCriteria', searchCriteria)}
                required
              >
                <option disabled value="" />
                {criteria.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    className="px-4 py-1.5 font-semibold hover:bg-stone-100 cursor-pointer text-blue-500 border-b border-gray-200"
                  >
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="col-span-3 md:col-span-1 flex gap-2 flex-col justify-start">
              <Label color={getErrorColor('searchTerm')} htmlFor="searchTerm">
                Termino de busqueda
              </Label>
              <TextInput
                id="searchTerm"
                type="text"
                placeholder="Busca un valor"
                value={searchTerm}
                onChange={(e) => handleChange('searchTerm', e.target.value)}
                color={getErrorColor('searchTerm')}
                onBlur={() => handleBlur('searchTerm', searchTerm)}
                required
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="w-full bg-purple-500 text-white rounded-lg py-2 mt-8"
          >
            Agregar búsqueda
          </button>
        </ModalForm>
      )}
    </>
  );
};

export default React.memo(TableSearchByHeader);
