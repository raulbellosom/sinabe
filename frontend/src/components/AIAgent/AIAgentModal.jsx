import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  TextInput,
  Badge,
  Card,
  Spinner,
  Alert,
} from 'flowbite-react';
import {
  HiSearch,
  HiX,
  HiExternalLink,
  HiInformationCircle,
  HiEye,
  HiSparkles,
  HiLightBulb,
  HiClock,
} from 'react-icons/hi';
import { useAIAgentOperations } from '../../hooks/useAIAgent';
import AIResultCard from './AIResultCard';
import AIModelSpecs from './AIModelSpecs';

const AIAgentModal = () => {
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
    closeModal,
    setQuery,
    handleSearch,
    handleItemSelect,
    handleGetSpecs,
    navigateToInventory,
    clearError,
    getSearchModeText,
    isSerialQuery,
  } = useAIAgentOperations();

  const [localQuery, setLocalQuery] = useState('');

  // Sync local query with context
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Handle search submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!localQuery.trim() || isLoading) return;

    setQuery(localQuery);
    await handleSearch(localQuery);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setLocalQuery(e.target.value);
    if (error) clearError();
  };

  // Handle clear search
  const handleClear = () => {
    setLocalQuery('');
    setQuery('');
  };

  // Get search placeholder text
  const getPlaceholderText = () => {
    return 'Busca inventarios con IA: "laptop HP con status alta" o "MXL43329WW"';
  };

  // Render search suggestions
  const renderSuggestions = () => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <HiLightBulb className="text-yellow-500" />
          Sugerencias de serial similares:
        </h4>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => {
                setLocalQuery(suggestion.serialNumber);
                setQuery(suggestion.serialNumber);
                handleSearch(suggestion.serialNumber);
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">
                  {suggestion.serialNumber}
                </span>
                <Badge color="yellow" size="sm">
                  Distancia: {suggestion.dist}
                </Badge>
              </div>
              {suggestion.modelName && (
                <p className="text-sm text-gray-600">{suggestion.modelName}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render search results
  const renderResults = () => {
    if (!searchResults || searchResults.length === 0) {
      return (
        <div className="text-center py-8">
          <HiInformationCircle className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-500">No se encontraron resultados</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <HiSparkles className="text-purple-500" />
            {getSearchModeText(searchMode)} - {searchResults.length}{' '}
            resultado(s)
          </h4>
        </div>

        {searchResults.map((result, index) => (
          <AIResultCard
            key={result.id || index}
            result={result}
            onSelect={() => handleItemSelect(result)}
            onViewSpecs={() => handleGetSpecs(result.id)}
            onNavigate={() => navigateToInventory(result)}
            isSelected={selectedItem?.id === result.id}
          />
        ))}
      </div>
    );
  };

  return (
    <Modal
      show={isModalOpen}
      onClose={closeModal}
      size="4xl"
      className="ai-agent-modal"
    >
      <Modal.Header className="border-b border-gray-200">
        <div className="flex items-center gap-3">
          <HiSparkles className="text-2xl text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Agente de IA
            </h3>
            <p className="text-sm text-gray-600">
              Busca inventarios usando lenguaje natural o números de serie
            </p>
          </div>
        </div>
        {!isHealthy && (
          <Badge color="failure" size="sm" className="ml-auto">
            Servicio no disponible
          </Badge>
        )}
      </Modal.Header>

      <Modal.Body className="p-6">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <TextInput
                type="text"
                placeholder={getPlaceholderText()}
                value={localQuery}
                onChange={handleInputChange}
                disabled={isLoading || !isHealthy}
                className="pr-10"
                icon={HiSearch}
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <HiX className="text-lg" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              color="purple"
              disabled={!localQuery.trim() || isLoading || !isHealthy}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <HiSearch />
                  <span>Buscar</span>
                </>
              )}
            </Button>
          </div>

          {/* Query type indicator */}
          {localQuery && (
            <div className="mt-2 flex items-center gap-2">
              <Badge
                color={isSerialQuery(localQuery) ? 'info' : 'purple'}
                size="sm"
              >
                {isSerialQuery(localQuery)
                  ? 'Búsqueda por serial'
                  : 'Búsqueda inteligente'}
              </Badge>
              {isLoading && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <HiClock className="animate-spin" />
                  <span>Este proceso puede tardar varios segundos...</span>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Error Display */}
        {error && (
          <Alert color="failure" className="mb-4">
            <HiInformationCircle className="mr-2" />
            <span className="font-medium">Error:</span> {error}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <Spinner size="lg" />
            <p className="mt-2 text-gray-600">
              La IA está procesando tu consulta...
            </p>
            <p className="text-sm text-gray-500">
              Esto puede tomar hasta 30 segundos
            </p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && searchResults && renderResults()}

        {/* Suggestions */}
        {!isLoading && renderSuggestions()}

        {/* Model Specs */}
        {selectedItem && modelSpecs && (
          <AIModelSpecs
            item={selectedItem}
            specs={modelSpecs}
            onClose={() => handleItemSelect(null)}
          />
        )}
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200">
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-gray-500">
            {isHealthy ? (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Servicio de IA activo
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Servicio de IA no disponible
              </span>
            )}
          </div>
          <Button color="gray" onClick={closeModal}>
            Cerrar
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AIAgentModal;
