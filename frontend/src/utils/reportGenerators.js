import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { API_URL } from '../services/api';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  BorderStyle,
  ImageRun,
  AlignmentType,
  WidthType,
  VerticalAlign,
} from 'docx';

export const generateExcelReport = async (inventories) => {
  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Inventarios');

    ws.columns = [
      { header: 'Marca', key: 'brand', width: 15 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Modelo', key: 'model', width: 25 },
      { header: 'Número de Serie', key: 'serial', width: 20 },
      { header: 'Número de Activo', key: 'active', width: 20 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'F. Creación', key: 'createdAt', width: 15 },
      { header: 'F. Actualización', key: 'updatedAt', width: 15 },
      { header: 'Imagen', key: 'img', width: 12 },
    ];

    let rowIdx = 2; // la fila 1 es el header
    for (const inv of Object.values(inventories)) {
      ws.addRow({
        brand: inv.model?.brand?.name || '',
        type: inv.model?.type?.name || '',
        model: inv.model?.name || '',
        serial: inv.serialNumber || '',
        active: inv.activeNumber || '',
        status: inv.status || '',
        createdAt: new Date(inv.createdAt).toLocaleDateString(),
        updatedAt: new Date(inv.updatedAt).toLocaleDateString(),
      });

      // Inserta miniatura si viene el buffer
      if (inv.imageBuffer) {
        try {
          // si tienes el tipo, úsalo; si no, asume jpeg
          const ext = inv.imageExt || 'jpeg';
          const imageId = wb.addImage({
            buffer: new Uint8Array(inv.imageBuffer),
            extension: ext, // 'jpeg' | 'png'
          });

          // Columna 9 (índice 8) es la de 'Imagen'
          ws.addImage(imageId, {
            tl: { col: 8, row: rowIdx - 1 },
            ext: { width: 64, height: 64 },
          });

          // Ajusta altura de fila (~50 px ≈ 38 pt)
          ws.getRow(rowIdx).height = 48;
        } catch (imgError) {
          console.error('Error al procesar la imagen:', imgError);
        }
      }

      rowIdx++;
    }

    const buf = await wb.xlsx.writeBuffer();
    const ts = new Date()
      .toISOString()
      .replace(/[:-]/g, '_')
      .replace(/\..+/, '')
      .replace('T', '_');
    saveAs(
      new Blob([buf], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `Baja_de_equipos_${ts}.xlsx`,
    );
  } catch (error) {
    console.error('Error en generateExcelReport:', error);
    throw new Error('Error al generar el reporte Excel: ' + error.message);
  }
};

// Función auxiliar para ajustar dimensiones manteniendo proporción
const fitDimensions = (width, height, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

// Función para comprimir imagen usando canvas
const compressImage = async (img, maxSizeKB = 500) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Establecer dimensiones iniciales manteniendo proporción
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  const aspectRatio = width / height;

  // Si la imagen es muy grande, reducir dimensiones
  const MAX_DIMENSION = 1500;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      width = MAX_DIMENSION;
      height = width / aspectRatio;
    } else {
      height = MAX_DIMENSION;
      width = height * aspectRatio;
    }
  }

  canvas.width = width;
  canvas.height = height;

  // Dibujar imagen en el canvas
  ctx.drawImage(img, 0, 0, width, height);

  // Comenzar con calidad alta e ir ajustando si es necesario
  let quality = 0.9;
  let dataUrl;
  let iterations = 0;
  const maxIterations = 10;

  do {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    // Calcular tamaño aproximado (el string base64 es 4/3 del tamaño real)
    const sizeInKB = Math.round((dataUrl.length * 0.75) / 1024);

    if (sizeInKB <= maxSizeKB || iterations >= maxIterations) {
      break;
    }

    // Reducir calidad para la siguiente iteración
    quality *= (maxSizeKB / sizeInKB) * 0.95;
    quality = Math.max(0.1, quality); // No bajar de 0.1
    iterations++;
  } while (true);

  // Convertir base64 a ArrayBuffer
  const base64 = dataUrl.split(',')[1];
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return {
    buffer: bytes.buffer,
    width,
    height,
    quality,
  };
};

// Función para cargar y procesar una imagen desde URL
const loadImage = async (imageUrl) => {
  try {
    // Construir URL completa
    const fullUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${API_URL}/${imageUrl}`;

    // Descargar la imagen
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const blob = await response.blob();

    // Cargar imagen en objeto Image
    const img = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });

    // Comprimir imagen
    const compressed = await compressImage(img);

    return {
      buffer: compressed.buffer,
      width: compressed.width,
      height: compressed.height,
    };
  } catch (error) {
    console.error('Error loading image:', error);
    throw error;
  }
};

export const generateWordReport = async (inventories) => {
  try {
    const sections = [];

    // Procesar cada inventario como una sección separada
    for (const inventory of Object.values(inventories)) {
      const children = [];

      // Encabezado del inventario
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${inventory.model?.brand?.name || ''} ${inventory.model?.type?.name || ''} ${inventory.model?.name || ''}`,
              bold: true,
              size: 32,
            }),
          ],
          spacing: { after: 400 },
          alignment: AlignmentType.CENTER,
        }),
      );

      // Tabla de información básica
      const infoRows = [
        createTableRow('Número de Serie', inventory.serialNumber || ''),
        createTableRow('Número de Activo', inventory.activeNumber || ''),
        createTableRow('Estado', inventory.status || ''),
        createTableRow(
          'F. Creación',
          new Date(inventory.createdAt).toLocaleDateString(),
        ),
        createTableRow(
          'F. Actualización',
          new Date(inventory.updatedAt).toLocaleDateString(),
        ),
      ];

      // Agregar tabla de información
      children.push(
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
            insideHorizontal: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
            insideVertical: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: '000000',
            },
          },
          rows: infoRows,
        }),
      );

      // Espaciado después de la tabla
      children.push(new Paragraph({ spacing: { after: 200 } }));

      if (inventory.images && inventory.images.length > 0) {
        // Encabezado de la sección de imágenes
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Imágenes del Equipo',
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
        );

        const processedImages = [];
        // Procesar todas las imágenes disponibles
        for (const image of inventory.images) {
          try {
            // Preferir la miniatura si está disponible, sino usar la URL original
            const imageUrl = image.thumbnail || image.url;
            if (imageUrl) {
              const { buffer, width, height } = await loadImage(imageUrl);
              const { width: newWidth, height: newHeight } = fitDimensions(
                width,
                height,
                220,
                160,
              );

              processedImages.push({
                data: buffer,
                width: newWidth,
                height: newHeight,
              });
            }
          } catch (error) {
            console.error('Error processing image:', error);
            // Continuar con la siguiente imagen si hay error
            continue;
          }
        }

        // Crear tablas de 3 columnas para las imágenes
        for (let i = 0; i < processedImages.length; i += 3) {
          const tableRow = new TableRow({
            children: Array.from({ length: 3 }, (_, j) => {
              const img = processedImages[i + j];
              return new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: {
                  size: 33,
                  type: WidthType.PERCENTAGE,
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      img
                        ? new ImageRun({
                            data: img.data,
                            transformation: {
                              width: img.width,
                              height: img.height,
                            },
                          })
                        : new TextRun(''),
                    ],
                  }),
                ],
              });
            }),
          });

          children.push(
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [tableRow],
            }),
          );
        }
      }

      // Agregar esta sección al documento
      sections.push({
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: children,
      });
    }

    // Crear documento con todas las secciones
    const doc = new Document({
      sections: sections,
    });

    // Generar nombre de archivo con timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:-]/g, '_')
      .replace(/\..+/, '')
      .replace('T', '_');
    const fileName = `Baja_de_equipos_${timestamp}.docx`;

    // Generar y guardar documento
    const blob = await Packer.toBlob(doc);
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error en generateWordReport:', error);
    throw new Error('Error al generar el documento Word: ' + error.message);
  }
};

function createTableRow(label, value) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, bold: true })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ text: value ?? '' })],
      }),
    ],
  });
}
