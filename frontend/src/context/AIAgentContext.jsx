import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import { aiService } from '../services/ai.api';

// AI Agent initial state
const initialState = {
  isModalOpen: false,
  isLoading: false,
  query: '',
  searchResults: null,
  searchMode: null,
  selectedItem: null,
  modelSpecs: null,
  error: null,
  suggestions: [],
  isHealthy: false,
  config: null,
};

// AI Agent action types
export const AI_ACTIONS = {
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  SET_LOADING: 'SET_LOADING',
  SET_QUERY: 'SET_QUERY',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_SELECTED_ITEM: 'SET_SELECTED_ITEM',
  SET_MODEL_SPECS: 'SET_MODEL_SPECS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SUGGESTIONS: 'SET_SUGGESTIONS',
  SET_HEALTH_STATUS: 'SET_HEALTH_STATUS',
  SET_CONFIG: 'SET_CONFIG',
  RESET_SEARCH: 'RESET_SEARCH',
};

// AI Agent reducer
const aiAgentReducer = (state, action) => {
  switch (action.type) {
    case AI_ACTIONS.OPEN_MODAL:
      return { ...state, isModalOpen: true, error: null };

    case AI_ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        isModalOpen: false,
        query: '',
        searchResults: null,
        selectedItem: null,
        modelSpecs: null,
        error: null,
        suggestions: [],
      };

    case AI_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AI_ACTIONS.SET_QUERY:
      return { ...state, query: action.payload };

    case AI_ACTIONS.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload.results,
        searchMode: action.payload.mode,
        suggestions: action.payload.suggestions || [],
        isLoading: false,
        error: null,
      };

    case AI_ACTIONS.SET_SELECTED_ITEM:
      return { ...state, selectedItem: action.payload };

    case AI_ACTIONS.SET_MODEL_SPECS:
      return { ...state, modelSpecs: action.payload, isLoading: false };

    case AI_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case AI_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AI_ACTIONS.SET_SUGGESTIONS:
      return { ...state, suggestions: action.payload };

    case AI_ACTIONS.SET_HEALTH_STATUS:
      return { ...state, isHealthy: action.payload };

    case AI_ACTIONS.SET_CONFIG:
      return { ...state, config: action.payload };

    case AI_ACTIONS.RESET_SEARCH:
      return {
        ...state,
        searchResults: null,
        selectedItem: null,
        modelSpecs: null,
        suggestions: [],
        query: '',
        error: null,
      };

    default:
      return state;
  }
};

// Create AI Agent context
const AIAgentContext = createContext();

// AI Agent Provider component
export const AIAgentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(aiAgentReducer, initialState);

  // Action creators
  const openModal = useCallback(() => {
    dispatch({ type: AI_ACTIONS.OPEN_MODAL });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: AI_ACTIONS.CLOSE_MODAL });
  }, []);

  const setQuery = useCallback((query) => {
    dispatch({ type: AI_ACTIONS.SET_QUERY, payload: query });
  }, []);

  const searchInventories = useCallback(async (query) => {
    if (!query.trim()) return;

    dispatch({ type: AI_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AI_ACTIONS.CLEAR_ERROR });

    try {
      const results = await aiService.hybridSearch(query.trim());
      dispatch({ type: AI_ACTIONS.SET_SEARCH_RESULTS, payload: results });
    } catch (error) {
      dispatch({ type: AI_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  const selectItem = useCallback((item) => {
    dispatch({ type: AI_ACTIONS.SET_SELECTED_ITEM, payload: item });
  }, []);

  const getModelSpecs = useCallback(async (inventoryId) => {
    dispatch({ type: AI_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AI_ACTIONS.CLEAR_ERROR });

    try {
      const specs = await aiService.getModelSpecs(inventoryId);
      dispatch({ type: AI_ACTIONS.SET_MODEL_SPECS, payload: specs });
    } catch (error) {
      dispatch({ type: AI_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const health = await aiService.checkHealth();
      dispatch({ type: AI_ACTIONS.SET_HEALTH_STATUS, payload: health.ok });
      return health.ok;
    } catch (error) {
      dispatch({ type: AI_ACTIONS.SET_HEALTH_STATUS, payload: false });
      return false;
    }
  }, []);

  const getConfig = useCallback(async () => {
    try {
      const config = await aiService.getConfig();
      dispatch({ type: AI_ACTIONS.SET_CONFIG, payload: config });
      return config;
    } catch (error) {
      console.error('Failed to get AI config:', error);
      return null;
    }
  }, []);

  const resetSearch = useCallback(() => {
    dispatch({ type: AI_ACTIONS.RESET_SEARCH });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AI_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    // State
    ...state,

    // Actions
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
  };

  return (
    <AIAgentContext.Provider value={value}>{children}</AIAgentContext.Provider>
  );
};

// Custom hook to use AI Agent context
export const useAIAgent = () => {
  const context = useContext(AIAgentContext);
  if (!context) {
    throw new Error('useAIAgent must be used within an AIAgentProvider');
  }
  return context;
};

export default AIAgentContext;
