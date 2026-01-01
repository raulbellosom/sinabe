import { Router } from 'express';
import { getPool } from '../services/mysql.js';
import { qdrantPing } from '../services/qdrant.js';
import { ollamaPing } from '../services/ollama.js';

export const healthRouter = Router();

healthRouter.get('/', async (req, res) => {
  const out = { ok: true, mysql: null, qdrant: null, ollama: null, ts: new Date().toISOString() };

  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT 1 AS ok');
    out.mysql = rows?.[0]?.ok === 1 ? 'ok' : 'unknown';
  } catch (e) {
    out.ok = false;
    out.mysql = `error: ${e.message}`;
  }

  if (process.env.ENABLE_QDRANT === 'true') {
    try { out.qdrant = await qdrantPing(); }
    catch (e) { out.ok = false; out.qdrant = `error: ${e.message}`; }
  } else out.qdrant = 'disabled';

  if (process.env.USE_OLLAMA === 'true') {
    try { out.ollama = await ollamaPing(); }
    catch (e) { out.ok = false; out.ollama = `error: ${e.message}`; }
  } else out.ollama = 'disabled';

  res.status(out.ok ? 200 : 500).json(out);
});
