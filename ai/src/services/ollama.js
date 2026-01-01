const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function postJson(path, body) {
  const r = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`Ollama ${path} failed: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function ollamaPing() {
  const r = await fetch(`${baseUrl}/api/tags`);
  if (!r.ok) throw new Error(`Ollama ping failed: ${r.status}`);
  return 'ok';
}

export async function ollamaChat({ model, messages }) {
  return postJson('/api/chat', { model, messages, stream: false });
}

export async function ollamaEmbed({ model, input }) {
  const res = await postJson('/api/embeddings', { model, prompt: input });
  if (res.embedding) return res.embedding;
  if (res.data?.[0]?.embedding) return res.data[0].embedding;
  throw new Error('Unexpected embeddings response from Ollama');
}
