import { useCallback, useEffect, useState } from 'react';
import { useAIAgent } from '../context/AIAgentContext.jsx';

// Custom hook for AI Agent functionality
export const useAIAgentOperations = () => {
  const {
    isModalOpen,
    isLoading,
    query,
    searchResults,
    searchMode,
    selectedItem,
    modelSpecs,
    error,
    suggestions,
    isHealthy,
    config,
    openModal,
    closeModal,
    setQuery,
    searchInventories,
    selectItem,
    getModelSpecs,
    checkHealth,
    getConfig,
    resetSearch,
    clearError,
  } = useAIAgent();

  const [initialized, setInitialized] = useState(false);

  // Initialize AI service on first load
  useEffect(() => {
    const initializeAI = async () => {
      if (!initialized) {
        await checkHealth();
        await getConfig();
        setInitialized(true);
      }
    };

    initializeAI();
  }, [initialized, checkHealth, getConfig]);

  // Handle search with debouncing
  const handleSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery?.trim()) return;

      await searchInventories(searchQuery);
    },
    [searchInventories],
  );

  // Handle item selection and navigation
  const handleItemSelect = useCallback(
    (item) => {
      selectItem(item);
    },
    [selectItem],
  );

  // Handle model specs request
  const handleGetSpecs = useCallback(
    async (inventoryId) => {
      if (inventoryId) {
        await getModelSpecs(inventoryId);
      }
    },
    [getModelSpecs],
  );

  // Navigate to inventory detail
  const navigateToInventory = useCallback((inventory) => {
    // Navigate to inventory view page
    const inventoryUrl = `/inventories/view/${inventory.id}`;
    window.open(inventoryUrl, '_blank');
  }, []);

  // Format search results for display
  const formatSearchResults = useCallback((results) => {
    if (!results) return [];

    return results.map((item) => ({
      ...item,
      displayTitle: `${item.brandName} ${item.modelName}`,
      displaySubtitle: `Serial: ${item.serialNumber} | Status: ${item.status}`,
      displayDescription: item.comments || 'Sin comentarios disponibles',
    }));
  }, []);

  // Check if query looks like a serial number
  const isSerialQuery = useCallback((query) => {
    if (!query) return false;
    // Basic pattern for serial numbers (alphanumeric, certain length)
    const serialPattern = /^[A-Z0-9]{6,}$/i;
    return serialPattern.test(query.trim());
  }, []);

  // Get search mode display text
  const getSearchModeText = useCallback((mode) => {
    switch (mode) {
      case 'hybrid':
        return 'Búsqueda inteligente';
      case 'serial-exact':
        return 'Búsqueda por serial (exacta)';
      case 'serial-fuzzy':
        return 'Búsqueda por serial (aproximada)';
      default:
        return 'Búsqueda';
    }
  }, []);

  // Handle modal close with cleanup
  const handleCloseModal = useCallback(() => {
    resetSearch();
    closeModal();
  }, [resetSearch, closeModal]);

  return {
    // State
    isModalOpen,
    isLoading,
    query,
    searchResults: formatSearchResults(searchResults),
    searchMode,
    selectedItem,
    modelSpecs,
    error,
    suggestions,
    isHealthy,
    config,
    initialized,

    // Actions
    openModal,
    closeModal: handleCloseModal,
    setQuery,
    handleSearch,
    handleItemSelect,
    handleGetSpecs,
    navigateToInventory,
    resetSearch,
    clearError,

    // Utilities
    isSerialQuery,
    getSearchModeText,
  };
};

export default useAIAgentOperations;
