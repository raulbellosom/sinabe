import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convierte "data:image/png;base64,...." o "base64 puro" a Buffer
 */
function base64ToBuffer(base64) {
  if (!base64) return null;
  const cleaned = base64.includes("base64,")
    ? base64.split("base64,")[1]
    : base64;
  return Buffer.from(cleaned, "base64");
}

/**
 * LibreOffice DOCX -> PDF
 * Requiere que exista el binario "soffice" en el sistema.
 */
async function convertDocxToPdf({ docxPath, outDir }) {
  fs.mkdirSync(outDir, { recursive: true });

  const sofficeBin =
    process.platform === "win32"
      ? "C:\\Program Files\\LibreOffice\\program\\soffice.exe"
      : "soffice";

  await execFileAsync(sofficeBin, [
    "--headless",
    "--nologo",
    "--nofirststartwizard",
    "--convert-to",
    "pdf",
    "--outdir",
    outDir,
    docxPath,
  ]);

  const pdfPath = path.join(
    outDir,
    path.basename(docxPath, path.extname(docxPath)) + ".pdf"
  );

  if (!fs.existsSync(pdfPath)) {
    throw new Error("LibreOffice no generó el PDF (archivo no encontrado).");
  }

  return pdfPath;
}

/**
 * Genera PDF desde plantilla DOCX corporativa usando tags {{}}.
 * Mantiene formato (márgenes, fuentes, colores, tablas, estilos) del Word.
 *
 * IMPORTANTE: tu docx debe tener:
 * - tags simples: {{date}}, {{receiver.name}}, etc.
 * - tabla de equipos con loop: {{#items}} ... {{/items}}
 *
 * Firmas:
 * - Si quieres firmas como imagen en Word, coloca tags en el docx:
 *   {{receiverSignature}} y {{delivererSignature}}
 *   y manda base64 en data.signatures.receiver / data.signatures.deliverer
 */
export const generateCustodyPDF = async (data) => {
  try {
    // 1) Path del template DOCX
    const templatePath = path.join(
      __dirname,
      "../../assets/templates/resguardo_ti.docx"
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        `No existe el template DOCX en: ${templatePath}. Verifica la ruta.`
      );
    }

    // 2) Normalizar items: mínimo 2 filas para mantener "striped" si lo necesitas
    const items = Array.isArray(data.items) ? data.items : [];
    const emptyRow = {
      typeBrand: "",
      model: "",
      serialNumber: "",
      assetNumber: "",
      invoiceNumber: "",
      features: "",
    };

    const normalizedItems =
      items.length >= 2
        ? items
        : [...items, ...Array(2 - items.length).fill(emptyRow)];

    // 3) Data final que calza con tags del docx
    //    OJO: aquí respetamos tu estructura actual que arma el controller. :contentReference[oaicite:3]{index=3}
    const templateData = {
      date: data.date ?? "",

      receiverName: data.receiver?.name ?? "",
      receiverEmployeeNumber: data.receiver?.employeeNumber ?? "",
      receiverJobTitle: data.receiver?.jobTitle ?? "",
      receiverDepartment: data.receiver?.department ?? "",

      delivererName: data.delivererName ?? "",
      comments: data.comments ?? "",

      items: normalizedItems,

      receiverSignature: data.signatures?.receiver ?? null,
      delivererSignature: data.signatures?.deliverer ?? null,
    };

    // 4) Preparar Docxtemplater + módulo de imágenes (opcional)
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);

    const imageModule = new ImageModule({
      centered: false,
      fileType: "docx",

      // Recibe el valor del tag (base64), regresa Buffer
      getImage: (tagValue) => {
        const buf = base64ToBuffer(tagValue);
        if (!buf) return Buffer.alloc(0);
        return buf;
      },

      // Ajusta tamaño de firmas (en px). Puedes cambiar a tu gusto.
      // Si en Word el espacio es más grande/pequeño, ajusta aquí.
      getSize: () => {
        return [220, 80]; // width, height
      },
    });

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
      delimiters: {
        start: "{{",
        end: "}}",
      },
    });

    doc.render(templateData);

    const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });

    // 5) Guardar temporal DOCX y convertir a PDF
    const tmpDir = path.join(os.tmpdir(), "sinabe-resguardos");
    fs.mkdirSync(tmpDir, { recursive: true });

    const id = randomUUID();
    const docxPath = path.join(tmpDir, `${id}.docx`);
    fs.writeFileSync(docxPath, docxBuffer);

    const pdfPath = await convertDocxToPdf({ docxPath, outDir: tmpDir });
    const pdfBuffer = fs.readFileSync(pdfPath);

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF from DOCX template:", error);
    throw error;
  }
};
