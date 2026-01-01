import { ollamaEmbed } from './ollama.js';
import { searchVector } from './qdrant.js';

export async function semanticCandidateIds(plan) {
  if (process.env.ENABLE_QDRANT !== 'true') return [];
  if (process.env.USE_OLLAMA !== 'true') return [];

  const q = plan?.semantic?.query;
  if (!q) return [];

  const embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
  const vector = await ollamaEmbed({ model: embedModel, input: q });

  const topK = plan?.semantic?.topK ?? Number(process.env.QDRANT_TOPK || 60);
  const res = await searchVector({ vector, limit: topK });

  const hits = res?.result || [];
  return hits.map(h => String(h.id));
}
