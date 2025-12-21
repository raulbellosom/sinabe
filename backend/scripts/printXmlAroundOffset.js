import fs from "fs";
import PizZip from "pizzip";

const templatePath = process.argv[2];
const offsetStr = process.argv[3];
const file = process.argv[4] || "word/document.xml";

if (!templatePath || !offsetStr) {
  console.error(
    "Uso: node scripts/printXmlAroundOffset.js <docx> <offset> [file]"
  );
  process.exit(1);
}

const offset = Number(offsetStr);
const content = fs.readFileSync(templatePath, "binary");
const zip = new PizZip(content);

const xml = zip.files[file]?.asText();
if (!xml) {
  console.error(`No se encontró ${file}`);
  process.exit(1);
}

const start = Math.max(0, offset - 120);
const end = Math.min(xml.length, offset + 120);

const snippet = xml.slice(start, end);
console.log(`\n✅ File: ${file}`);
console.log(`✅ Offset: ${offset}`);
console.log("\n---- SNIPPET ----\n");
console.log(snippet);
console.log("\n-----------------\n");
