import 'dotenv/config';
import { ensureCollection } from '../services/qdrant.js';
import { ollamaEmbed } from '../services/ollama.js';

async function main() {
  if (process.env.ENABLE_QDRANT !== 'true') {
    console.log('ENABLE_QDRANT=false. Nothing to do.');
    return;
  }
  if (process.env.USE_OLLAMA !== 'true') {
    console.log('USE_OLLAMA=false. Nothing to do.');
    return;
  }

  const embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
  const vec = await ollamaEmbed({ model: embedModel, input: 'test' });
  const r = await ensureCollection({ vectorSize: vec.length });
  console.log('Qdrant collection:', r);
}

main().catch((e) => { console.error(e); process.exit(1); });
