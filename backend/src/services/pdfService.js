import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCustodyPDF = async (data) => {
  try {
    // Load Logo
    const logoPath = path.join(
      __dirname,
      "../../assets/templates/gap_logo.png"
    );
    let logoBase64 = "";
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = logoBuffer.toString("base64");
    }

    // HTML Template
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resguardo de Equipo Tecnológico</title>
    <style>
      /* --- Configuración de Página para Impresión (Tamaño Carta) --- */
      @page {
        size: letter;
        margin: 0.3in 0.5in; /* Reduced top/bottom to 0.3in */
        margin-bottom: 20mm; /* Reduced space for footer */
      }

      body {
        margin: 0;
        padding: 0;
        background-color: #f0f0f0;
        font-family: Arial, Helvetica, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .page {
        width: 215.9mm;
        min-height: 279.4mm;
        background-color: white;
        margin: 20px auto;
        padding: 20px 50px; /* Reduced vertical padding from 40px to 20px */
        box-sizing: border-box;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        position: relative;
        padding-bottom: 0px; /* Remove padding bottom to let content flow effectively before margin */
      }

      /* --- Estilos Generales de Tabla --- */
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }

      th,
      td {
        border: 2px solid #b4b9bc; /* Borde más oscuro y definido */
        padding: 5px 6px;
        vertical-align: middle;
      }

      /* --- Cabecera (Logo y Dirección) --- */
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 25px;
      }

      .logo-container {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .logo-box {
        width: 60px; /* Reduced size */
      }
      
      .logo-box img {
        max-width: 100%;
        height: auto;
      }

      .logo-text {
        font-family: Arial, Helvetica, sans-serif;
        color: #5c2d91; /* Purple color matching GAP logo */
        font-size: 14px;
        line-height: 1.1;
      }

      .logo-text strong {
        font-weight: bold;
        display: block;
      }

      .header-text {
        text-align: right;
        font-size: 13px;
        font-weight: normal;
        color: #44546a;
        padding-bottom: 5px; /* Visual alignment */
      }

      /* --- Título Principal y Fecha --- */
      .title-table td {
        border: 2px solid #b4b9bc;
      }

      .title-cell {
        background-color: white;
        font-weight: bold;
        font-size: 15px;
        text-transform: uppercase;
        padding: 10px;
        width: 75%;
      }

      .date-label {
        background-color: white;
        font-weight: bold;
        text-align: center;
        width: 10%;
        font-size: 11px;
        line-height: 1.2;
      }

      .date-input {
        background-color: #ededed;
        width: 15%;
        text-align: center;
        font-weight: bold;
      }

      /* --- Títulos de Sección (Datos del Empleado, etc.) --- */
      .section-title {
        text-align: center;
        font-weight: bold;
        font-size: 15px;
        /* Color "Azul Negro" solicitado */
        color: #44546a;
        margin-top: 15px;
        margin-bottom: 5px;
      }
      .section-item-data {
        text-align: center;
        font-weight: bold;
        font-size: 15px;
        /* Color "Azul Negro" solicitado */
        color: #44546a;
        border: 2px solid #b4b9bc;
        padding: 20px 0px 5px 0px;
        margin-top: 0px;
        border-top: 0px;
        border-bottom: 0px;
      }

      /* --- Tabla Datos del Empleado --- */

      .data-table th {
        font-weight: bold;
        text-align: center; /* Solicitud: Textos centrados */
        background-color: transparent; /* Changed to gray */
        width: 30%;
        color: #000;
      }

      .data-table td {
        background-color: transparent; /* Only headers gray usually for this section, user image 1 shows white cells for values? No, user image 1 shows values (Name, Number) with WHITE background. The labels are GRAY (#ededed) */
      }

      /* --- Tabla Datos del Equipo --- */
      .equipment-table {
        margin-bottom: 0; /* Pegado a la sección siguiente si se desea, o con poco margen */
        border: 2px solid #b4b9bc;
      }

      .equipment-table th {
        background-color: transparent; /* Gray headers */
        text-align: center;
        font-weight: bold;
        color: #000;
      }

      /* Estilo Zebra para JS */
      .equipment-table tbody tr:nth-child(odd) {
        background-color: #ededed; /* Gris */
      }
      .equipment-table tbody tr:nth-child(even) {
        background-color: white; /* Blanco */
      }

      .equipment-table td {
        height: 25px;
        text-align: center;
        font-size: 10px; /* Reduced for better fit */
      }

      /* --- Tabla Comentarios --- */
      /* Usamos una tabla para que los bordes coincidan exactamente */
      .comments-table {
        margin-top: 0px; /* Separación visual estándar entre Equipo y Comentarios */
        margin-bottom: 0px;
      }

      .comments-header {
        background-color: #ededed;
        font-weight: bold;
        text-align: center;
        color: #44546a; /* Mismo tono "azul negro" para consistencia o gris oscuro */
        font-size: 15px;
        padding: 9px;
        padding-bottom: 0px;
        border-top: none;
      }

      .comments-cell {
        height: 80px; /* Altura fija para la caja */
        vertical-align: top;
        background-color: white;
        padding: 10px;
        white-space: pre-wrap; /* Respect line breaks */
      }

      /* --- Disclaimer Legal --- */
      .legal-text {
        padding: 10px;
        font-size: 10px;
        text-align: justify;
        line-height: 1.3;
        margin-top: 0px; /* Para que el borde se fusione con la tabla de comentarios si se desea pegado */
        border: 2px solid #b4b9bc;
        border-top: none;
      }

      /* Separar legal text si comentarios está separado */
      .legal-text {
        margin-top: 0px;
      }

      /* --- Firmas --- */
      .signatures-container {
        display: flex;
        justify-content: space-between;
        padding: 0 20px;
        /* Avoid breaking inside signatures */
        page-break-inside: avoid;
      }

      .signature-box {
        width: 40%;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: flex-end; /* Align content to bottom */
      }
      
      .signature-image-container {
        height: 75px;
        width: auto;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        margin-bottom: 5px;
      }

      .signature-line {
        border-top: 1px solid #000;
        margin-bottom: 5px;
      }

      .signature-title {
        font-weight: bold;
        font-style: italic;
        font-size: 11px;
        margin-bottom: 2px;
      }

      .signature-sub {
        font-size: 11px;
        font-weight: bold;
      }
      
      .signature-data {
        font-size: 11px;
        margin-bottom: 2px;
        min-height: 24px; /* Space for text if empty */
      }

      /* --- Footer --- */
      /* Fixed Footer Logic */
      .footer-container {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 20px; /* Reduced height to keep it lower */
        background-color: transparent; /* Transparent so it doesn't hide text */
        padding: 0 30px; /* Match page padding */
        z-index: 1000;
        margin-bottom: 10mm; 
      }

      .footer-line {
        border-top: 1px solid #ccc;
        margin-bottom: 5px; 
      }

      .footer-codes {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: #888;
      }

      @media print {
        body {
          background-color: white;
        }
        .page {
          box-shadow: none;
          margin: 0;
          width: 100%;
          padding: 40px 50px;
          /* Important: allow page to flow */
          height: auto;
          min-height: auto;
        }
        
        .footer-container {
            position: fixed;
            bottom: 0px; /* Very low bottom */
            padding: 0 0.5in; /* Match print margin width essentially */
            padding-bottom: 10px;
            left: 0;
            right: 0;
            width: 100%;
            box-sizing: border-box;
            background-color: transparent;
            margin-bottom: 0;
        }
      }
    </style>
  </head>
  <body>
    <!-- Footer outside page div for fixed positioning relative to viewport/page -->
    <div class="footer-container">
        <div class="footer-line"></div>
        <div class="footer-codes">
            <span>GAPTI-F-018 RESGUARDO DE EQUIPO TECNOLOGICO</span>
            <span>Rev. 01</span>
        </div>
    </div>

    <div class="page">
      <div class="header-container">
        <div class="logo-container">
            <div class="logo-box">
                 ${
                   logoBase64
                     ? `<img src="data:image/png;base64,${logoBase64}" alt="GAP Logo">`
                     : `<div style="width:50px; height:50px;"></div>`
                 }
            </div>
            <div class="logo-text">
                <strong>Grupo</strong>
                <strong>Aeroportuario</strong>
                <strong>del Pacífico</strong>
            </div>
        </div>
        <div class="header-text">
          DIRECCION DE SOSTENIBILIDAD, CALIDAD E INNOVACION
        </div>
      </div>

      <table class="title-table">
        <tr>
          <td class="title-cell">RESGUARDO DE EQUIPO TECNOLÓGICO</td>
          <td class="date-label">Fecha<br />dd/mm/aaaa</td>
          <td class="date-input">${data.date}</td>
        </tr>
      </table>

      <div class="section-title">Datos del Empleado</div>
      <table class="data-table">
        <tr>
          <th>Nombre</th>
          <td>${data.receiver.name}</td>
        </tr>
        <tr>
          <th>Número</th>
          <td>${data.receiver.employeeNumber || ""}</td>
        </tr>
        <tr>
          <th>Área de Adscripción</th>
          <td>${data.receiver.department || ""}</td>
        </tr>
      </table>

      <div class="section-item-data">Datos del Equipo</div>
      <table class="equipment-table">
        <thead>
          <tr>
            <th style="width: 12%">Tipo / Marca</th>
            <th style="width: 15%">Modelo</th>
            <th style="width: 15%">Serie</th>
            <th style="width: 15%">Núm. Activo</th>
            <th style="width: 15%">Factura</th>
            <th>Características</th>
          </tr>
        </thead>
        <tbody id="equipment-body">
             ${data.items
               .map(
                 (item) => `
          <tr>
            <td>${item.typeBrand}</td>
            <td>${item.model}</td>
            <td>${item.serialNumber}</td>
            <td>${item.assetNumber || ""}</td>
            <td>${item.invoiceNumber || ""}</td>
            <td>${item.features || ""}</td>
          </tr>
             `
               )
               .join("")}
             ${
               data.items.length === 1
                 ? `
          <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          `
                 : ""
             }
        </tbody>
      </table>

      <table class="comments-table">
        <thead>
          <tr>
            <th class="comments-header">Comentarios</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="comments-cell">${data.comments || ""}</td>
          </tr>
        </tbody>
      </table>

      <div class="legal-text">
        Se hace entrega del equipo o equipos descritos en el presente documento
        para su resguardo, quedando bajo su responsabilidad el buen uso que haga
        del mismo de acuerdo a las políticas de uso de bienes del Grupo
        Aeroportuario del Pacífico. Toda Información que administre o este a su
        alcance como usuario, debe apegarse a las Normas establecidas por GAP o
        sus Subsidiarias. En caso de incumplimiento de estas, se aplicará lo
        establecido en el Código de Conducta y Reglamento Interior que
        corresponda según la Subsidiaria en que labore.
      </div>

      <div class="signatures-container">
        <div class="signature-box">
          <div class="signature-image-container">
               ${
                 data.signatures.receiver
                   ? `<img src="${data.signatures.receiver}" style="max-height: 75px; max-width: 100%;" />`
                   : ""
               }
          </div>
          <div class="signature-data">
               ${data.receiver.name}<br>
               ${data.date}
          </div>
          <div class="signature-line"></div>
          <div class="signature-title">Recibí equipo</div>
          <div class="signature-sub">Nombre, Firma y Fecha</div>
        </div>

        <div class="signature-box">
          <div class="signature-image-container">
               ${
                 data.signatures.deliverer
                   ? `<img src="${data.signatures.deliverer}" style="max-height: 75px; max-width: 100%;" />`
                   : ""
               }
          </div>
          <div class="signature-data">
               ${data.delivererName || ""}<br>
               ${data.date}
          </div>
          <div class="signature-line"></div>
          <div class="signature-title">Entrega</div>
          <div class="signature-sub">Nombre, Firma y Fecha</div>
        </div>
      </div>
    </div>
  </body>
</html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Safe for most container environments
    });
    const page = await browser.newPage();

    // Set content
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0px",
        bottom: "0px",
        left: "0px",
        right: "0px",
      },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF with Puppeteer:", error);
    throw error;
  }
};
