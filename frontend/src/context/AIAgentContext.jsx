import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';
import { aiService } from '../services/ai.api';

// AI Agent initial state
const initialState = {
  isModalOpen: false,
  isLoading: false,
  query: '',
  error: null,
  isHealthy: false,
  config: null,
};

// AI Agent action types
export const AI_ACTIONS = {
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  SET_LOADING: 'SET_LOADING',
  SET_QUERY: 'SET_QUERY',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_HEALTH_STATUS: 'SET_HEALTH_STATUS',
  SET_CONFIG: 'SET_CONFIG',
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
        error: null,
      };

    case AI_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AI_ACTIONS.SET_QUERY:
      return { ...state, query: action.payload };

    case AI_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    case AI_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case AI_ACTIONS.SET_HEALTH_STATUS:
      return { ...state, isHealthy: action.payload };

    case AI_ACTIONS.SET_CONFIG:
      return { ...state, config: action.payload };

    default:
      return state;
  }
};

// Create AI Agent context
const AIAgentContext = createContext();

// AI Agent Provider component
export const AIAgentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(aiAgentReducer, initialState);

  // Check health on mount
  useEffect(() => {
    checkHealth();
    // Check health periodically (every 60 seconds)
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const checkHealth = useCallback(async () => {
    try {
      const health = await aiService.checkHealth();
      dispatch({
        type: AI_ACTIONS.SET_HEALTH_STATUS,
        payload: health.ok === true,
      });
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
    checkHealth,
    getConfig,
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
