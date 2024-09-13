import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import ImageViewer from '../../components/ImageViewer/ImageViewer';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import { RiImageEditLine } from 'react-icons/ri';
import { MdImageSearch } from 'react-icons/md';
import { LuImageOff } from 'react-icons/lu';
import AccountFields from '../../components/AccountFields/AccountFields';

const Account = () => {
  const inputRef = useRef(null);
  const { user, updateProfileImage } = useAuthContext();
  const [extraActions, setExtraActions] = useState([]);
  const [image, setImage] = useState(user?.photo || '');
  const [userFields, setUserFields] = useState([]);

  useEffect(() => {
    if (image) {
      setExtraActions([
        {
          label: 'Descartar cambios',
          icon: LuImageOff,
          action: () => setImage(user?.photo || ''),
          color: 'red',
        },
        {
          label: 'Guardar cambios',
          icon: RiImageEditLine,
          action: () => handleImageUpload(),
          filled: image ? true : false,
          color: 'orange',
        },
      ]);
    } else {
      setExtraActions([
        {
          label: 'Seleccionar imagen',
          icon: MdImageSearch,
          action: () => inputRef.current.click(),
          color: 'blue',
        },
      ]);
    }
  }, [image]);

  useEffect(() => {
    setUserFields([
      {
        id: 'firstName',
        label: 'Nombre',
        name: 'firstName',
        value: user.firstName,
        onChange: handleFieldChange,
        enableEdit: true,
        onCancele: handleDiscardFieldChanges,
      },
      {
        id: 'lastName',
        label: 'Apellidos',
        name: 'lastName',
        value: user.lastName,
        onChange: handleFieldChange,
        enableEdit: true,
        onCancele: handleDiscardFieldChanges,
      },
      {
        id: 'email',
        label: 'Correo electrónico',
        name: 'email',
        value: user.email,
        onChange: handleFieldChange,
        enableEdit: true,
        onCancele: handleDiscardFieldChanges,
      },
      {
        id: 'phone',
        label: 'Teléfono',
        name: 'phone',
        value: user.phone,
        onChange: handleFieldChange,
        enableEdit: true,
        onCancele: handleDiscardFieldChanges,
      },
    ]);
  }, [user]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setUserFields((prev) => {
      return prev.map((field) => {
        if (field.name === name) {
          return { ...field, value };
        }

        return field;
      });
    });
  };

  const handleDiscardFieldChanges = () => {
    setUserFields((prev) => {
      return prev.map((field) => {
        return { ...field, value: user[field.name] };
      });
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setImage(file);
  };

  const handleImageUpload = () => {
    updateProfileImage(image);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white shadow-md p-4 rounded-lg">
        <form className="flex gap-4">
          <ImageViewer
            imageClassName={'rounded-full overflow-hidden'}
            images={[image]}
          />
          <div>
            <p className="text-xl font-semibold">Cambiar imagen de perfil</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
            <div className="flex gap-2">
              <ActionButtons extraActions={extraActions} />
            </div>
          </div>
        </form>
      </section>
      <section className="bg-white shadow-md p-4 rounded-lg">
        <div>
          <h2 className="text-xl font-bold mb-4">Información de la cuenta</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {user &&
              userFields.map((field) => {
                return (
                  <AccountFields
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onCancele={field.onCancele}
                    enableEdit={field.enableEdit}
                  />
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Account;
