import 'dotenv/config';

async function main() {
  const base = `http://localhost:${process.env.PORT || 4080}`;
  const r = await fetch(`${base}/health`);
  const j = await r.json();
  console.log(JSON.stringify(j, null, 2));
  process.exit(r.ok ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
