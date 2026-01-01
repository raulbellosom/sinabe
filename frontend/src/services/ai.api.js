import axios from 'axios';

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:4080';

const aiApi = axios.create({
  baseURL: AI_URL,
  timeout: 60000, // 60 segundos timeout
});

/**
 * AI Service - Handles all AI-related API calls
 *
 * Response Types:
 * - list: { type: 'list', total, items, page, limit, hasMore }
 * - aggregation: { type: 'aggregation', metric: 'count', total } or with groupBy and rows
 * - mixed: { type: 'mixed', total, items } for missing field queries
 */
export const aiService = {
  /**
   * Health check
   * @returns {Promise<{ok: boolean, mysql: string, qdrant: string, ollama: string}>}
   */
  checkHealth: async () => {
    try {
      const response = await aiApi.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { ok: false, error: error.message };
    }
  },

  /**
   * Get AI service configuration
   * @returns {Promise<{features, limits, intents, groupByOptions, missingFields, statusOptions}>}
   */
  getConfig: async () => {
    try {
      const response = await aiApi.get('/ai/config');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get config: ${error.message}`);
    }
  },

  /**
   * Get query suggestions for UI
   * @returns {Promise<{suggestions: Array<{category: string, examples: string[]}>}>}
   */
  getSuggestions: async () => {
    try {
      const response = await aiApi.get('/ai/suggestions');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get suggestions: ${error.message}`);
    }
  },

  /**
   * Main query endpoint - natural language search
   * @param {string} query - Natural language query
   * @param {Object} options - { page, limit }
   * @returns {Promise<AIQueryResponse>}
   */
  query: async (query, options = {}) => {
    try {
      const { page = 1, limit = 50 } = options;
      const response = await aiApi.post('/ai/query', {
        q: query,
        page,
        limit,
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(`Query failed: ${error.message}`);
    }
  },

  /**
   * Load more results (pagination)
   * @param {string} query - Same query
   * @param {number} page - Next page number
   * @param {number} limit - Items per page
   */
  loadMore: async (query, page, limit = 50) => {
    return aiService.query(query, { page, limit });
  },

  // Legacy compatibility - maps to new query endpoint
  hybridSearch: async (query) => {
    const result = await aiService.query(query);
    // Transform to legacy format for backward compatibility
    return {
      results: result.items || [],
      mode: result.type,
      total: result.total,
      suggestions: [],
    };
  },

  // Placeholder for future model specs feature
  getModelSpecs: async (inventoryId) => {
    // This would need a backend endpoint - for now return empty
    return { specs: null, message: 'Not implemented' };
  },
};

export default aiService;
