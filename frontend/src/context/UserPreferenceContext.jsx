import { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import userPreferenceService from '../services/userPreferenceService';

const UserPreferenceContext = createContext();

export const useUserPreference = () => useContext(UserPreferenceContext);

// Preferencias por defecto del sistema
export const DEFAULT_PREFERENCES = {
  inventoryDetailViewMode: 'list', // 'list' | 'cards'
  notificationSoundEnabled: true, // Sonido de notificaciones activado por defecto
  // Agregar más preferencias aquí según se necesiten
};

export const UserPreferenceProvider = ({ children }) => {
  const { user, token } = useAuthContext();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPreferences = async () => {
    if (user && token) {
      try {
        setLoading(true);
        const data = await userPreferenceService.getPreferences(token);
        setPreferences(data);
      } catch (error) {
        console.error('Failed to fetch preferences', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user, token]);

  const updateSidebarBg = async (bgId) => {
    try {
      const updated = await userPreferenceService.updatePreferences(
        { sidebarBgId: bgId },
        token,
      );
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to update sidebar bg', error);
      throw error;
    }
  };

  const updateColumnSettings = async (settings) => {
    try {
      // Merge with existing settings to avoid overwriting other tables
      const currentSettings = preferences?.columnSettings || {};
      const newSettings = { ...currentSettings, ...settings };

      const updated = await userPreferenceService.updatePreferences(
        { columnSettings: newSettings },
        token,
      );
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to update column settings', error);
      throw error;
    }
  };

  const uploadSidebarBg = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const updated = await userPreferenceService.uploadSidebarImage(
        formData,
        token,
      );
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to upload sidebar bg', error);
      throw error;
    }
  };

  // Función genérica para actualizar cualquier preferencia en el campo `preferences` JSON
  const updatePreference = async (key, value) => {
    try {
      const currentPrefs = preferences?.preferences || {};
      const newPrefs = { ...currentPrefs, [key]: value };

      const updated = await userPreferenceService.updatePreferences(
        { preferences: newPrefs },
        token,
      );
      setPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Failed to update preference', error);
      throw error;
    }
  };

  // Obtener una preferencia específica con valor por defecto del sistema
  const getPreference = (key, defaultValue = null) => {
    const systemDefault = DEFAULT_PREFERENCES[key] ?? defaultValue;
    return preferences?.preferences?.[key] ?? systemDefault;
  };

  // Restablecer todas las preferencias a los valores por defecto
  const resetPreferencesToDefault = async () => {
    try {
      const updated = await userPreferenceService.updatePreferences(
        { preferences: DEFAULT_PREFERENCES },
        token,
      );
      setPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Failed to reset preferences', error);
      throw error;
    }
  };

  return (
    <UserPreferenceContext.Provider
      value={{
        preferences,
        updateSidebarBg,
        uploadSidebarBg,
        updateColumnSettings,
        updatePreference,
        getPreference,
        resetPreferencesToDefault,
        DEFAULT_PREFERENCES,
        refreshPreferences: fetchPreferences,
        loading,
      }}
    >
      {children}
    </UserPreferenceContext.Provider>
  );
};
