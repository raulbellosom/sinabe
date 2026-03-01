import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { PhotoProvider, PhotoView } from 'react-photo-view';

import { useAuthContext } from '../../context/AuthContext';
import { FormattedUrlImage } from '../../utils/FormattedUrlImage';

import 'react-photo-view/dist/react-photo-view.css';

const photoViewOverrideStyles = `
  .PhotoView-Portal {
    z-index: 10001 !important;
  }
`;

const UserMenuDropdown = ({ className = '' }) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [photoViewOpen, setPhotoViewOpen] = useState(false);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const { firstName, lastName, email, photo } = user || {};

  const photoUrl = photo ? FormattedUrlImage(photo) : null;
  const photoKey = photo?.id || photo?.url || 'no-photo';

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
    if (!open) return undefined;

    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (photoViewOpen) return;

      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    if (!open) return undefined;

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      icon: User,
      onClick: () => handleNavigate('/account-settings'),
    },
    {
      label: 'Configuración',
      icon: Settings,
      onClick: () => handleNavigate('/preferences'),
    },
  ];

  return (
    <div className={classNames('relative', className)} ref={buttonRef}>
      <style>{photoViewOverrideStyles}</style>

      <button
        type="button"
        onClick={() => {
          if (!open) {
            updateDropdownPosition();
          }
          setOpen((prev) => !prev);
        }}
        className={classNames(
          'flex items-center gap-2 rounded-full p-1.5 pr-2 transition-all duration-200',
          open
            ? 'bg-[color:var(--surface-muted)] ring-2 ring-[color:var(--primary)]/30'
            : 'hover:bg-[color:var(--surface-muted)]',
        )}
      >
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-300 sm:h-8 sm:w-8">
          {photoUrl ? (
            <img
              key={photoKey}
              src={photoUrl}
              alt={firstName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[color:var(--primary)] text-sm font-semibold text-white">
              {firstName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        <span className="hidden max-w-[80px] truncate text-sm font-medium text-[color:var(--foreground)] sm:block">
          {firstName}
        </span>
        <ChevronDown
          className={classNames(
            'hidden h-4 w-4 text-[color:var(--foreground-muted)] transition-transform duration-200 sm:block',
            open && 'rotate-180',
          )}
        />
      </button>

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
                className="z-[9999] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl"
              >
                <div className="border-b border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
                  <div className="flex items-center gap-3">
                    <PhotoProvider
                      maskOpacity={0.9}
                      onVisibleChange={(visible) => {
                        setPhotoViewOpen(visible);
                      }}
                    >
                      <PhotoView src={photoUrl}>
                        <div className="h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-full bg-gray-300 shadow ring-2 ring-white transition-all hover:ring-[color:var(--primary)]/30">
                          {photoUrl ? (
                            <img
                              key={photoKey}
                              src={photoUrl}
                              alt={firstName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[color:var(--primary)] text-lg font-bold text-white">
                              {firstName?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </PhotoView>
                    </PhotoProvider>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[color:var(--foreground)]">
                        {firstName} {lastName}
                      </p>
                      <p className="truncate text-xs text-[color:var(--foreground-muted)]">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  {menuItems.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={item.onClick}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[color:var(--foreground)] transition-colors hover:bg-[color:var(--surface-muted)]"
                    >
                      <item.icon className="h-5 w-5 text-[color:var(--foreground-muted)]" />
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-[color:var(--border)] p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[color:var(--danger)] transition-colors hover:bg-[color:var(--danger)]/10"
                  >
                    <LogOut className="h-5 w-5" />
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

