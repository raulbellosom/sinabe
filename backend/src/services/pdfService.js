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
  <meta charset="UTF-8">
  <title>GAPTI-F-018 RESGUARDO DE EQUIPO TECNOLOGICO</title>
  <style>
    /* ---------------------------------------------------------------------- */
    /* 1. CONFIGURACIÓN DE PÁGINA: TAMAÑO CARTA (Letter) */
    /* ---------------------------------------------------------------------- */
    @page {
      size: letter; /* Carta (215.9mm x 279.4mm) */
      margin: 0;
    }
    
    * {
      box-sizing: border-box;
      /* Asegura que los colores y fondos se impriman */
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      background: #525659;
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
    }

    .page {
      width: 216mm; /* Ancho de Carta */
      min-height: 279.4mm; /* Alto de Carta */
      background: #ffffff;
      padding: 15mm 20mm; /* Márgenes internos */
      position: relative;
    }

    /* --- ESTILOS DE TABLA UNIFICADOS --- */
    table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      font-size: 10px;
      margin-bottom: 0; 
    }

    td, th {
      border: 1px solid #999; /* Borde gris medio */
      padding: 4px 6px;
      vertical-align: middle;
    }
    
    /* ---------------------------------------------------------------------- */
    /* 2. HEADER Y TÍTULO SUPERIOR */
    /* ---------------------------------------------------------------------- */
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 5px;
    }
    
    .logo-block {
      width: 200px; 
      display: flex;
      align-items: center;
      gap: 5px; 
    }
    
    .logo-block img {
      width: 50px;
      height: auto;
    }
    
    .logo-text {
      font-size: 11px;
      line-height: 1.1;
      color: #4A148C; /* Purple color */
      font-weight: bold;
    }
    
    .logo-text strong {
      display: block;
    }

    .dept-text {
      flex: 1; 
      text-align: right; 
      font-size: 11px;
      font-weight: normal;
      padding-top: 10px;
    }
    
    /* Barra Título Principal y Fecha */
    .title-bar-table {
      margin-top: 20px;
      margin-bottom: 15px;
    }
    .main-title-cell {
      font-weight: bold;
      font-size: 13px;
      padding: 8px;
      text-transform: uppercase;
      border: 1px solid #999; 
      width: 70%;
      background: #fcfcfc;
    }
    /* Estilo del bloque de la fecha */
    .date-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
        margin: 0;
    }
    .date-table td {
        border: 1px solid #999;
        text-align: center;
        padding: 5px;
    }
    .date-header {
      background-color: #F2F2F2;
      font-weight: bold;
      line-height: 1.2;
      width: 50%;
    }
    .date-input-box {
        width: 50%;
        background-color: #ffffff;
    }
    .date-val {
      font-weight: normal;
    }
    
    /* ---------------------------------------------------------------------- */
    /* 3. SECCIONES DE DATOS: Títulos y Bordes */
    /* ---------------------------------------------------------------------- */
    
    /* Títulos de Sección integrados en la tabla */
    .section-title-cell {
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      color: #5B6476; /* Azul grisáceo oscuro */
      background: #ffffff; 
      padding: 8px 6px;
      border-bottom: 1px solid #999;
    }
    
    /* **CORRECCIÓN BORDES DATOS DEL EMPLEADO** */
    #employee-title-cell {
        border-top: none !important;
        border-left: none !important;
        border-right: none !important;
    }


    /* Etiquetas gris (Nombre, Número) */
    .label-col {
      font-weight: bold;
      width: 25%;
      text-align: left;
      padding-left: 15px;
      background-color: #F2F2F2; 
    }

    /* Encabezados de columnas (Tipo/Marca, Modelo...) */
    .col-header {
      font-weight: bold;
      text-align: center;
      background-color: #F2F2F2;
    }
    
    /* --- COMENTARIOS Y LEGAL --- */
    #comments-table tr:first-child .section-title-cell {
        border-bottom: none;
        border-top: none;
    }
    .comments-cell {
      height: 70px;
      vertical-align: top;
    }

    .legal-cell {
      font-size: 9px; 
      text-align: justify;
      line-height: 1.3;
      padding: 8px 10px;
    }

    /* ---------------------------------------------------------------------- */
    /* 4. FIRMAS Y PIE DE PÁGINA */
    /* ---------------------------------------------------------------------- */
    
    .signatures-area {
      margin-top: 40px;
      display: flex;
      justify-content: space-around;
      font-size: 10px;
    }
    .sig-box {
      width: 35%;
      text-align: center;
    }
    .sig-line {
      border-top: 1px solid #000;
      margin-bottom: 4px;
    }
    .sig-text {
      font-weight: bold;
      font-style: italic;
      line-height: 1.2;
    }
    .sig-sub-text {
        font-weight: normal;
        font-style: normal;
    }
    .sig-filled-data {
        font-weight: bold;
        margin-top: 2px;
    }

    .note {
      margin-top: 6px;
      font-size: 9px;
      font-style: italic;
    }

    .bottom-footer {
      position: absolute;
      bottom: 12mm;
      left: 20mm;
      right: 20mm;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #888;
    }

    @media print {
      body { background: none; }
      .page { box-shadow: none; margin: 0; width: 100%; height: 100%; padding: 15mm 20mm; }
    }
  </style>
</head>
<body>

  <div class="page">
    
    <div class="header-container">
      <div class="logo-block">
        ${
          logoBase64
            ? `<img src="data:image/png;base64,${logoBase64}" alt="GAP Logo">`
            : `<div style="width:50px; height:50px;"></div>`
        }
        <div class="logo-text">
          <strong>Grupo<br>
          Aeroportuario<br>
          del Pacífico
          </strong>
        </div>
      </div>
      <div class="dept-text">
        DIRECCION DE SOSTENIBILIDAD, CALIDAD E INNOVACION
      </div>
    </div>

    <table class="title-bar-table" style="border:none;">
      <tr>
        <td class="main-title-cell">RESGUARDO DE EQUIPO TECNOLÓGICO</td>
        <td style="padding:0; border:none; width: 30%;">
          <table class="date-table">
            <tr>
              <td class="date-header">
                Fecha<br><span class="date-val">dd/mm/aaaa</span>
              </td>
              <td class="date-input-box">${data.date}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th colspan="2" class="section-title-cell" id="employee-title-cell">Datos del Empleado</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="label-col">Nombre</td>
                <td>${data.receiver.name}</td>
            </tr>
            <tr>
                <td class="label-col">Número</td>
                <td>${data.receiver.employeeNumber || ""}</td>
            </tr>
            <tr>
                <td class="label-col">Área de Adscripción</td>
                <td>${data.receiver.department || ""}</td>
            </tr>
        </tbody>
    </table>

    <table>
        <thead>
            <tr>
                <th colspan="6" class="section-title-cell">Datos del Equipo</th>
            </tr>
            <tr>
                <th class="col-header" style="width:15%">Tipo /<br>Marca</th>
                <th class="col-header" style="width:15%">Modelo</th>
                <th class="col-header" style="width:15%">Serie</th>
                <th class="col-header" style="width:15%">Núm. Activo</th>
                <th class="col-header" style="width:15%">Factura</th>
                <th class="col-header" style="width:25%">Características</th>
            </tr>
        </thead>
        <tbody>
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
            <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        </tbody>
    </table>

    <table id="comments-table">
        <thead>
            <tr>
                <th class="section-title-cell">Comentarios</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="comments-cell">${data.comments || ""}</td>
            </tr>
            <tr>
                <td class="legal-cell">
                    Se hace entrega del equipo o equipos descritos en el presente documento para su resguardo, quedando bajo su responsabilidad el buen uso que haga del mismo de acuerdo a las políticas de uso de bienes del Grupo Aeroportuario del Pacífico. Toda Información que administre o este a su alcance como usuario, debe apegarse a las Normas establecidas por GAP o sus Subsidiarias. En caso de incumplimiento de estas, se aplicará lo establecido en el Código de Conducta y Reglamento Interior que corresponda según la Subsidiaria en que labore.
                </td>
            </tr>
        </tbody>
    </table>

    <div class="signatures-area">
      <div class="sig-box">
        <div class="sig-text">Recibí equipo</div>
        <div style="height: 50px; display: flex; align-items: flex-end; justify-content: center;">
           ${
             data.signatures.receiver
               ? `<img src="${data.signatures.receiver}" style="max-height: 50px; max-width: 100%;" />`
               : ""
           }
        </div>
        <div class="sig-line"></div>
        <div class="sig-sub-text">Nombre, Firma y Fecha</div>
        <div class="sig-filled-data">
            ${data.receiver.name}<br>
            ${data.date}
        </div>
      </div>
      <div class="sig-box">
        <div class="sig-text">Entrega</div>
        <div style="height: 50px; display: flex; align-items: flex-end; justify-content: center;">
           ${
             data.signatures.deliverer
               ? `<img src="${data.signatures.deliverer}" style="max-height: 50px; max-width: 100%;" />`
               : ""
           }
        </div>
        <div class="sig-line"></div>
        <div class="sig-sub-text">Nombre, Firma y Fecha</div>
        <div class="sig-filled-data">
            ${data.delivererName || ""}<br>
            ${data.date}
        </div>
      </div>
    </div>

    <div class="note">
      Nota: Para el llenado, solo imprimir la hoja 1
    </div>

    <div class="bottom-footer">
      <div>GAPTI-F-018 RESGUARDO DE EQUIPO TECNOLOGICO</div>
      <div>Rev. 01</div>
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
