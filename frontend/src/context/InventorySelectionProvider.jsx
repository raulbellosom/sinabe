import { useState, useEffect, useCallback, useContext } from 'react';
import InventorySelectionContext from './InventorySelectionContext';

const STORAGE_KEY = 'selected_inventories';

export const useInventorySelection = () => {
  const context = useContext(InventorySelectionContext);
  if (!context) {
    throw new Error(
      'useInventorySelection must be used within InventorySelectionProvider',
    );
  }
  return context;
};

export const InventorySelectionProvider = ({ children }) => {
  const [selectedInventories, setSelectedInventories] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar selecciones del localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSelectedInventories(parsed);
      }
    } catch (error) {
      console.error('Error loading selected inventories:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Guardar en localStorage cuando cambie la selección
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedInventories));
    } catch (error) {
      console.error('Error saving selected inventories:', error);
    }
  }, [selectedInventories]);

  // Agregar o quitar un inventario de la selección
  const toggleInventory = useCallback((inventory) => {
    setSelectedInventories((prev) => {
      const exists = prev.find((item) => item.id === inventory.id);
      if (exists) {
        return prev.filter((item) => item.id !== inventory.id);
      } else {
        return [...prev, inventory];
      }
    });
  }, []);

  // Verificar si un inventario está seleccionado
  const isSelected = useCallback(
    (inventoryId) => {
      return selectedInventories.some((item) => item.id === inventoryId);
    },
    [selectedInventories],
  );

  // Limpiar todas las selecciones
  const clearSelection = useCallback(() => {
    setSelectedInventories([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Agregar múltiples inventarios
  const addMultipleInventories = useCallback((inventories) => {
    setSelectedInventories((prev) => {
      const newInventories = inventories.filter(
        (inventory) => !prev.find((item) => item.id === inventory.id),
      );
      return [...prev, ...newInventories];
    });
  }, []);

  // Remover múltiples inventarios
  const removeMultipleInventories = useCallback((inventoryIds) => {
    setSelectedInventories((prev) =>
      prev.filter((item) => !inventoryIds.includes(item.id)),
    );
  }, []);

  // Actualizar inventarios existentes con nuevos datos (útil después de asignar a factura/OC)
  const updateInventories = useCallback((updatedInventories) => {
    if (!updatedInventories || updatedInventories.length === 0) {
      return;
    }

    setSelectedInventories((prev) => {
      // Crear un nuevo array forzando la actualización
      const newInventories = prev.map((item) => {
        const updated = updatedInventories.find(
          (inv) => inv && inv.id === item.id,
        );
        // Si hay actualización, retornar un nuevo objeto (no el mismo)
        return updated ? { ...updated } : item;
      });

      // Retornar nuevo array para forzar re-render
      return [...newInventories];
    });
  }, []);

  // Abrir/cerrar el carrito
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const value = {
    selectedInventories,
    isCartOpen,
    toggleInventory,
    isSelected,
    clearSelection,
    addMultipleInventories,
    removeMultipleInventories,
    updateInventories,
    openCart,
    closeCart,
    toggleCart,
    count: selectedInventories.length,
  };

  return (
    <InventorySelectionContext.Provider value={value}>
      {children}
    </InventorySelectionContext.Provider>
  );
};

export default InventorySelectionProvider;
