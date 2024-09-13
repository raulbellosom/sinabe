import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { AiFillEdit } from 'react-icons/ai';
import { FaSave } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

const AccountFields = ({
  id,
  label,
  name,
  value,
  onChange,
  enableEdit,
  onCancele,
}) => {
  const inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus(); // Se asegura de que el input reciba foco después de montarse
    }
  }, [isEditing]); // El efecto se ejecuta cuando cambia isEditing

  return (
    <div className="flex flex-col gap-1 relative">
      <label htmlFor={id} className="text-sm font-semibold text-stone-800">
        {label}
      </label>
      {enableEdit && isEditing ? (
        <input
          ref={inputRef}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={!enableEdit}
          className="w-full p-2 bg-stone-100 border-t-0 border-l-0 border-r-0 border-b border-2 border-stone-700"
        />
      ) : (
        <p
          className={classNames('p-2 border-b border-b-white', {
            'text-stone-800': !isEditing,
          })}
        >
          {value}
        </p>
      )}
      {enableEdit && (
        <div className="absolute right-0 top-5 p-2">
          {isEditing && (
            <>
              <button
                className="p-2"
                onClick={() => {
                  onCancele();
                  setIsEditing(false);
                }}
              >
                <IoMdClose size={20} />
              </button>
              <button className="p-2" onClick={() => setIsEditing(!isEditing)}>
                <FaSave size={20} />
              </button>
            </>
          )}
          {!isEditing && (
            <button className="p-2" onClick={() => setIsEditing(true)}>
              <AiFillEdit size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountFields;
