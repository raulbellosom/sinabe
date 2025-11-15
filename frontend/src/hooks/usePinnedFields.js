import { useState, useEffect, useCallback } from 'react';

const PINNED_FIELDS_KEY = 'inventory_pinned_fields';
const DRAFT_INVENTORY_KEY = 'inventory_draft';

export const usePinnedFields = () => {
  const [pinnedFields, setPinnedFields] = useState({});
  const [isPinMode, setIsPinMode] = useState(false);

  // Cargar campos fijados del localStorage al inicializar
  useEffect(() => {
    const savedPinnedFields = localStorage.getItem(PINNED_FIELDS_KEY);
    if (savedPinnedFields) {
      try {
        setPinnedFields(JSON.parse(savedPinnedFields));
      } catch (error) {
        console.error('Error parsing pinned fields:', error);
        localStorage.removeItem(PINNED_FIELDS_KEY);
      }
    }
  }, []);

  // Guardar campos fijados en localStorage
  const savePinnedFields = useCallback((fields) => {
    localStorage.setItem(PINNED_FIELDS_KEY, JSON.stringify(fields));
    setPinnedFields(fields);
  }, []);

  // Activar/desactivar modo pin
  const togglePinMode = useCallback(() => {
    setIsPinMode((prev) => !prev);
  }, []);

  // Fijar un campo
  const pinField = useCallback(
    (fieldName, value) => {
      const newPinnedFields = { ...pinnedFields, [fieldName]: value };
      savePinnedFields(newPinnedFields);
    },
    [pinnedFields, savePinnedFields],
  );

  // Desfijar un campo
  const unpinField = useCallback(
    (fieldName) => {
      const newPinnedFields = { ...pinnedFields };
      delete newPinnedFields[fieldName];
      savePinnedFields(newPinnedFields);
    },
    [pinnedFields, savePinnedFields],
  );

  // Limpiar todos los campos fijados
  const clearAllPinnedFields = useCallback(() => {
    localStorage.removeItem(PINNED_FIELDS_KEY);
    setPinnedFields({});
    setIsPinMode(false);
  }, []);

  // Verificar si un campo está fijado
  const isFieldPinned = useCallback(
    (fieldName) => {
      return pinnedFields.hasOwnProperty(fieldName);
    },
    [pinnedFields],
  );

  // Obtener valor de campo fijado
  const getPinnedValue = useCallback(
    (fieldName) => {
      return pinnedFields[fieldName];
    },
    [pinnedFields],
  );

  return {
    pinnedFields,
    isPinMode,
    togglePinMode,
    pinField,
    unpinField,
    clearAllPinnedFields,
    isFieldPinned,
    getPinnedValue,
  };
};

export const useDraftInventory = () => {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState(null);

  // Verificar si hay borrador al inicializar
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_INVENTORY_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setDraftData(draft);
        setHasDraft(true);
      } catch (error) {
        console.error('Error parsing draft inventory:', error);
        localStorage.removeItem(DRAFT_INVENTORY_KEY);
      }
    }
  }, []);

  // Guardar borrador
  const saveDraft = useCallback((data) => {
    localStorage.setItem(
      DRAFT_INVENTORY_KEY,
      JSON.stringify({
        ...data,
        timestamp: Date.now(),
      }),
    );
    setDraftData(data);
    setHasDraft(true);
  }, []);

  // Cargar borrador
  const loadDraft = useCallback(() => {
    return draftData;
  }, [draftData]);

  // Limpiar borrador
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_INVENTORY_KEY);
    setDraftData(null);
    setHasDraft(false);
  }, []);

  return {
    hasDraft,
    draftData,
    saveDraft,
    loadDraft,
    clearDraft,
  };
};
