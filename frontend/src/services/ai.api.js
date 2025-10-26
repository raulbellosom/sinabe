import axios from 'axios';

const AI_URL = import.meta.env.VITE_AI_URL || 'https://sinabe.giize.com/ai/';

const aiApi = axios.create({
  baseURL: AI_URL,
  timeout: 300000, // 5 minutos de timeout como indica la documentación
});

// Service functions for AI API
export const aiService = {
  // Health check
  checkHealth: async () => {
    try {
      const response = await aiApi.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // Get AI service configuration
  getConfig: async () => {
    try {
      const response = await aiApi.get('/config');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get config: ${error.message}`);
    }
  },

  // Hybrid search - principal endpoint para búsquedas
  hybridSearch: async (query) => {
    try {
      const response = await aiApi.post('/search/hybrid', { q: query });
      return response.data;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  },

  // Get model specifications for an inventory item
  getModelSpecs: async (inventoryId) => {
    try {
      const response = await aiApi.post('/models/specs', { id: inventoryId });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get model specs: ${error.message}`);
    }
  },

  // Get analytics charts (optional)
  getAnalyticsCharts: async () => {
    try {
      const response = await aiApi.get('/analytics/charts');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  },

  // Debug: Test Ollama embeddings
  testOllamaEmbed: async (text, model = 'nomic-embed-text') => {
    try {
      const response = await aiApi.post('/debug/ollama-embed', { text, model });
      return response.data;
    } catch (error) {
      throw new Error(`Embedding test failed: ${error.message}`);
    }
  },

  // Ingest data into AI system
  ingestData: async (options = {}) => {
    try {
      const defaultOptions = {
        collection: 'inventories_v1',
        pageSize: 100,
        embedConcurrency: 1,
        upsertChunk: 50,
        maxPages: 5,
        offsetPages: 0,
        ...options,
      };
      const response = await aiApi.post('/ingest', defaultOptions);
      return response.data;
    } catch (error) {
      throw new Error(`Data ingestion failed: ${error.message}`);
    }
  },
};

export default aiService;
