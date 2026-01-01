import 'dotenv/config';
import { getPool } from '../services/mysql.js';
import { DB } from '../config/dbNames.js';
import { upsertPoints } from '../services/qdrant.js';
import { ollamaEmbed } from '../services/ollama.js';

function bt(name) { return `\`${name}\``; }
function bc(table, col) { return `${bt(table)}.${bt(col)}`; }

const T = DB.tables;
const C = DB.cols;

function buildText(row) {
  const parts = [
    row.status && `Status: ${row.status}`,
    row.activeNumber && `Activo: ${row.activeNumber}`,
    row.serialNumber && `Serial: ${row.serialNumber}`,
    row.internalFolio && `Folio: ${row.internalFolio}`,
    row.brandName && `Marca: ${row.brandName}`,
    row.typeName && `Tipo: ${row.typeName}`,
    row.modelName && `Modelo: ${row.modelName}`,
    row.locationName && `Ubicación: ${row.locationName}`,
    row.invoiceCode && `Factura: ${row.invoiceCode}`,
    row.purchaseOrderCode && `OC: ${row.purchaseOrderCode}`,
    row.comments && `Comentarios: ${row.comments}`
  ].filter(Boolean);
  return parts.join('\n');
}

async function main() {
  if (process.env.ENABLE_QDRANT !== 'true') {
    console.log('ENABLE_QDRANT=false. Nothing to do.');
    return;
  }
  if (process.env.USE_OLLAMA !== 'true') {
    console.log('USE_OLLAMA=false. Nothing to do.');
    return;
  }

  const pool = getPool();
  const embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

  // Pull flattened records with joins
  const sql = `
    SELECT
      I.${bt(C.inventory.id)}            AS id,
      I.${bt(C.inventory.status)}        AS status,
      I.${bt(C.inventory.activeNumber)}  AS activeNumber,
      I.${bt(C.inventory.serialNumber)}  AS serialNumber,
      I.${bt(C.inventory.internalFolio)} AS internalFolio,
      I.${bt(C.inventory.comments)}      AS comments,
      I.${bt(C.inventory.enabled)}       AS enabled,
      I.${bt(C.inventory.createdAt)}     AS createdAt,
      M.${bt(C.model.name)}             AS modelName,
      B.${bt(C.brand.name)}             AS brandName,
      TY.${bt(C.type.name)}             AS typeName,
      L.${bt(C.location.name)}          AS locationName,
      INV.${bt(C.invoice.code)}         AS invoiceCode,
      PO.${bt(C.purchaseOrder.code)}    AS purchaseOrderCode
    FROM ${bt(T.inventory)} I
    JOIN ${bt(T.model)} M ON M.${bt(C.model.id)} = I.${bt(C.inventory.modelId)}
    JOIN ${bt(T.brand)} B ON B.${bt(C.brand.id)} = M.${bt(C.model.brandId)}
    JOIN ${bt(T.type)}  TY ON TY.${bt(C.type.id)} = M.${bt(C.model.typeId)}
    LEFT JOIN ${bt(T.location)} L ON L.${bt(C.location.id)} = I.${bt(C.inventory.locationId)}
    LEFT JOIN ${bt(T.invoice)} INV ON INV.${bt(C.invoice.id)} = I.${bt(C.inventory.invoiceId)}
    LEFT JOIN ${bt(T.purchaseOrder)} PO ON PO.${bt(C.purchaseOrder.id)} = I.${bt(C.inventory.purchaseOrderId)}
  `.trim();

  const [rows] = await pool.query(sql);

  const batchSize = 48; // keep RAM low
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const points = [];

    for (const r of batch) {
      const text = buildText(r);
      const vector = await ollamaEmbed({ model: embedModel, input: text });

      points.push({
        id: String(r.id),
        vector,
        payload: {
          status: r.status ?? null,
          brandName: r.brandName ?? null,
          typeName: r.typeName ?? null,
          modelName: r.modelName ?? null,
          locationName: r.locationName ?? null,
          invoiceCode: r.invoiceCode ?? null,
          purchaseOrderCode: r.purchaseOrderCode ?? null,
          enabled: r.enabled ?? null,
          createdAt: r.createdAt ?? null
        }
      });
    }

    await upsertPoints(points);
    console.log(`Upserted ${Math.min(i + batchSize, rows.length)} / ${rows.length}`);
  }

  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
