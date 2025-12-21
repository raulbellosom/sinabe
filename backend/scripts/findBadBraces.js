import fs from "fs";
import PizZip from "pizzip";

const templatePath = process.argv[2];
if (!templatePath) {
  console.error("Uso: node scripts/findBadBraces.js <ruta-al-docx>");
  process.exit(1);
}

const content = fs.readFileSync(templatePath, "binary");
const zip = new PizZip(content);

const xml = zip.files["word/document.xml"]?.asText();
if (!xml) {
  console.error("No se encontró word/document.xml");
  process.exit(1);
}

// Busca llaves triples o patrones raros
const patterns = [
  "{{{",
  "}}}",
  "{{ {{", // a veces quedan espacios raros
  "}} }}",
  "{{\n", // saltos raros
  "\n}}",
];

console.log(`\n✅ Plantilla: ${templatePath}\n`);

for (const p of patterns) {
  const count = (
    xml.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []
  ).length;
  console.log(`Patrón "${p}" -> ${count}`);
}

console.log(
  "\n📌 Si cualquiera de estos sale > 0, ahí está el problema: borra el tag y reescríbelo como {{tag}} (2 llaves exactas)."
);
