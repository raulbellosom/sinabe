import fs from "fs";
import path from "path";
import PizZip from "pizzip";

const templatePath = process.argv[2];
if (!templatePath) {
  console.error("Uso: node scripts/checkDocxTemplate.js <ruta-al-docx>");
  process.exit(1);
}

const content = fs.readFileSync(templatePath, "binary");
const zip = new PizZip(content);

const xml = zip.files["word/document.xml"]?.asText();
if (!xml) {
  console.error("No se encontró word/document.xml en el DOCX.");
  process.exit(1);
}

// Detecta tags partidos entre runs: {{... </w:t> ... <w:t ...}} ...}}
const brokenTagRegex = /\{\{[^}]*<\/w:t>[\s\S]*?<w:t[^>]*>[\s\S]*?\}\}/g;

const matches = xml.match(brokenTagRegex) || [];

console.log(`\n✅ Plantilla: ${templatePath}`);
console.log(`🔎 Tags partidos detectados: ${matches.length}\n`);

matches.slice(0, 30).forEach((m, i) => {
  // Limpia un poco para imprimir
  const cleaned = m
    .replace(/\s+/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  console.log(`${i + 1}) ${cleaned}`);
});

if (matches.length > 30) {
  console.log(`\n... y ${matches.length - 30} más.\n`);
}

console.log("\n📌 Si ves algo como '{{seri ... mber}}', ese tag está roto.");
console.log(
  "✅ Solución: borrar ese tag en Word y reescribirlo en una sola pasada.\n"
);
