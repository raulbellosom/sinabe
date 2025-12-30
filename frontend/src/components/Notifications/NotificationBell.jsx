/**
 * Componente de campana de notificaciones para el navbar
 * Responsivo con portal para mejor posicionamiento
 */
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiCheck, HiTrash, HiExternalLink, HiX } from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    notificationsLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [portalRoot, setPortalRoot] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Establecer portal root
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // Calcular posición del dropdown
  const updateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // En móvil, centrar el dropdown
    if (viewportWidth < 640) {
      const dropdownWidth = Math.min(340, viewportWidth - 32);
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: (viewportWidth - dropdownWidth) / 2,
        width: dropdownWidth,
        maxHeight: viewportHeight - rect.bottom - 24,
      });
      return;
    }

    // En desktop, alinear a la derecha del botón
    const dropdownWidth = 380;
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
      maxHeight: viewportHeight - rect.bottom - 24,
    });
  };

  // Actualizar posición cuando se abre
  useLayoutEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [isOpen]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Cargar notificaciones al abrir el dropdown
  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications({ limit: 10 });
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };

  const handleViewAll = () => {
    navigate('/preferences/notifications');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={buttonRef}>
      {/* Botón de campana */}
      <button
        onClick={handleToggle}
        className={classNames(
          'relative p-2 rounded-full transition-all duration-200',
          isOpen
            ? 'bg-purple-100 text-purple-600'
            : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50',
        )}
        aria-label="Notificaciones"
      >
        <HiBell className="w-6 h-6 sm:w-6 sm:h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown en portal */}
      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Overlay para móvil */}
                {isMobile && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 z-[9998]"
                    onClick={() => setIsOpen(false)}
                  />
                )}

                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={dropdownStyle}
                  className="z-[9999] bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                    <h3 className="font-semibold text-gray-900">
                      Notificaciones
                    </h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
                        >
                          <HiCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            Marcar leídas
                          </span>
                        </button>
                      )}
                      {isMobile && (
                        <button
                          onClick={() => setIsOpen(false)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <HiX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista de notificaciones */}
                  <div className="overflow-y-auto flex-1 max-h-[300px] sm:max-h-[380px]">
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-12 text-center px-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <HiBell className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-900 mb-1">
                          No tienes notificaciones
                        </p>
                        <p className="text-sm text-gray-500">
                          Las notificaciones aparecerán aquí
                        </p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={classNames(
                              'px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors',
                              !notification.isRead
                                ? 'bg-purple-50/50 hover:bg-purple-50'
                                : 'hover:bg-gray-50',
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                                  )}
                                  <h4 className="font-medium text-gray-900 text-sm truncate">
                                    {notification.title}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notification.body}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <p className="text-xs text-gray-400">
                                    {formatTime(notification.createdAt)}
                                  </p>
                                  {notification.ruleCreator && (
                                    <span className="text-xs text-purple-500 flex items-center gap-1">
                                      <span className="text-gray-400">•</span>
                                      De: {
                                        notification.ruleCreator.firstName
                                      }{' '}
                                      {notification.ruleCreator.lastName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0 pt-1">
                                {notification.link && (
                                  <HiExternalLink className="w-4 h-4 text-gray-300" />
                                )}
                                <button
                                  onClick={(e) =>
                                    handleDelete(e, notification.id)
                                  }
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <HiTrash className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <button
                      onClick={handleViewAll}
                      className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-1"
                    >
                      Ver todas las notificaciones
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          portalRoot,
        )}
    </div>
  );
};

export default NotificationBell;
