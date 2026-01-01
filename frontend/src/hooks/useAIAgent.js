import { useCallback, useEffect, useState } from 'react';
import { useAIAgent } from '../context/AIAgentContext.jsx';
import { aiService } from '../services/ai.api';

/**
 * Custom hook for AI Agent functionality
 * Provides additional utilities and operations on top of the base context
 */
export const useAIAgentOperations = () => {
  const {
    isModalOpen,
    isLoading,
    query,
    error,
    isHealthy,
    config,
    openModal,
    closeModal,
    setQuery,
    checkHealth,
    getConfig,
    clearError,
  } = useAIAgent();

  const [initialized, setInitialized] = useState(false);

  // Initialize AI service on first load - only if user is authenticated
  useEffect(() => {
    const initializeAI = async () => {
      // Solo inicializar si hay un token (usuario autenticado)
      const token = localStorage.getItem('token');
      if (!initialized && token) {
        await checkHealth();
        await getConfig();
        setInitialized(true);
      }
    };

    initializeAI();
  }, [initialized, checkHealth, getConfig]);

  // Handle search
  const handleSearch = useCallback(async (searchQuery, options = {}) => {
    if (!searchQuery?.trim()) return null;

    try {
      const result = await aiService.query(searchQuery, options);
      return result;
    } catch (err) {
      console.error('Search error:', err);
      throw err;
    }
  }, []);

  // Navigate to inventory detail
  const navigateToInventory = useCallback((inventory) => {
    const inventoryUrl = `/inventories/${inventory.id}`;
    window.location.href = inventoryUrl;
  }, []);

  // Check if query looks like a serial number
  const isSerialQuery = useCallback((q) => {
    if (!q) return false;
    const serialPattern = /^[A-Z0-9]{6,}$/i;
    return serialPattern.test(q.trim());
  }, []);

  // Get search mode display text
  const getSearchModeText = useCallback((mode) => {
    switch (mode) {
      case 'list':
        return 'Lista de inventarios';
      case 'aggregation':
        return 'Resultado agregado';
      case 'mixed':
        return 'Inventarios faltantes';
      default:
        return 'Búsqueda';
    }
  }, []);

  // Handle modal close with cleanup
  const handleCloseModal = useCallback(() => {
    closeModal();
  }, [closeModal]);

  return {
    // State
    isModalOpen,
    isLoading,
    query,
    error,
    isHealthy,
    config,
    initialized,

    // Actions
    openModal,
    closeModal: handleCloseModal,
    setQuery,
    handleSearch,
    navigateToInventory,
    clearError,
    checkHealth,
    getConfig,

    // Utilities
    isSerialQuery,
    getSearchModeText,
  };
};

export default useAIAgentOperations;
