import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { HiUser, HiCog, HiLogout, HiChevronDown } from 'react-icons/hi';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useAuthContext } from '../../context/AuthContext';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';

import 'react-photo-view/dist/react-photo-view.css';

// Estilos inline para asegurar que el PhotoView esté por encima del dropdown
const photoViewOverrideStyles = `
  .PhotoView-Portal {
    z-index: 10001 !important;
  }
`;

/**
 * UserMenuDropdown - Menú de usuario con foto, nombre y opciones
 */
const UserMenuDropdown = ({ className = '' }) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [photoViewOpen, setPhotoViewOpen] = useState(false);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const { firstName, lastName, email, photo, role } = user || {};

  // Obtener URL de la foto con cache-buster basado en el ID
  const photoUrl = photo ? FormattedUrlImage(photo) : null;
  const photoKey = photo?.id || photo?.url || 'no-photo';

  // Calcular posición del dropdown
  const updateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth =
      viewportWidth < 640 ? Math.min(280, viewportWidth - 32) : 280;

    let left = rect.right - dropdownWidth;
    if (left < 16) left = 16;
    if (left + dropdownWidth > viewportWidth - 16) {
      left = viewportWidth - dropdownWidth - 16;
    }

    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left,
      width: dropdownWidth,
    });
  };

  useEffect(() => {
    if (open) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [open]);

  // Cerrar al hacer clic fuera (solo si PhotoView no está abierto)
  useEffect(() => {
    const handleClickOutside = (e) => {
      // No cerrar si PhotoView está abierto
      if (photoViewOpen) return;

      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, photoViewOpen]);

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const menuItems = [
    {
      label: 'Mi Perfil',
      icon: HiUser,
      onClick: () => handleNavigate('/account-settings'),
    },
    {
      label: 'Configuración',
      icon: HiCog,
      onClick: () => handleNavigate('/preferences'),
    },
  ];

  return (
    <div className={classNames('relative', className)} ref={buttonRef}>
      {/* Estilos para PhotoView z-index */}
      <style>{photoViewOverrideStyles}</style>

      {/* Botón de usuario */}
      <button
        type="button"
        onClick={() => {
          if (!open) {
            // Calcular posición ANTES de abrir para evitar flash
            updateDropdownPosition();
          }
          setOpen(!open);
        }}
        className={classNames(
          'flex items-center gap-2 p-1.5 pr-2 rounded-full transition-all duration-200',
          open ? 'bg-gray-100 ring-2 ring-purple-300' : 'hover:bg-gray-50',
        )}
      >
        {/* Avatar */}
        <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-full overflow-hidden bg-gray-300 shrink-0">
          {photoUrl ? (
            <img
              key={photoKey}
              src={photoUrl}
              alt={firstName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white font-semibold text-sm">
              {firstName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
        {/* Nombre (solo en pantallas más grandes) */}
        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
          {firstName}
        </span>
        <HiChevronDown
          className={classNames(
            'hidden sm:block w-4 h-4 text-gray-400 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown en portal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && dropdownStyle.position && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={dropdownStyle}
                className="z-[9999] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
              >
                {/* Header con info del usuario */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <PhotoProvider
                      maskOpacity={0.9}
                      onVisibleChange={(visible) => {
                        setPhotoViewOpen(visible);
                      }}
                    >
                      <PhotoView src={photoUrl}>
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-300 shrink-0 ring-2 ring-white shadow cursor-pointer hover:ring-purple-300 transition-all">
                          {photoUrl ? (
                            <img
                              key={photoKey}
                              src={photoUrl}
                              alt={firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white font-bold text-lg">
                              {firstName?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </PhotoView>
                    </PhotoProvider>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {firstName} {lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>
                  </div>
                </div>

                {/* Opciones del menú */}
                <div className="p-2">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={item.onClick}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-gray-400" />
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Separador y cerrar sesión */}
                <div className="border-t border-gray-100 p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <HiLogout className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default UserMenuDropdown;
