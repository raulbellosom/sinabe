const qUrl = process.env.QDRANT_URL || 'http://localhost:6333';
const collection = process.env.QDRANT_COLLECTION || 'sinabe_inventories';

async function qFetch(path, options = {}) {
  const r = await fetch(`${qUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  if (!r.ok) throw new Error(`Qdrant ${path} failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function qdrantPing() {
  const r = await fetch(`${qUrl}/readyz`);
  if (!r.ok) throw new Error(`Qdrant ping failed: ${r.status}`);
  return 'ok';
}

export async function ensureCollection({ vectorSize }) {
  try { await qFetch(`/collections/${collection}`); return { ok: true, existed: true }; }
  catch {}
  await qFetch(`/collections/${collection}`, {
    method: 'PUT',
    body: JSON.stringify({ vectors: { size: vectorSize, distance: 'Cosine' } })
  });
  return { ok: true, existed: false };
}

export async function upsertPoints(points) {
  return qFetch(`/collections/${collection}/points?wait=true`, { method: 'PUT', body: JSON.stringify({ points }) });
}

export async function searchVector({ vector, limit = 50 }) {
  return qFetch(`/collections/${collection}/points/search`, { method: 'POST', body: JSON.stringify({ vector, limit }) });
}
