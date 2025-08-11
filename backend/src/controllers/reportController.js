import ExcelJS from "exceljs";
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
} from "docx";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función auxiliar para verificar si un archivo existe
import { existsSync } from "fs";

// Función auxiliar para comprimir imagen
const compressImage = async (imagePath, maxSizeKB = 500) => {
  try {
    // Verificar si el archivo existe
    if (!existsSync(imagePath)) {
      console.log(`La imagen no existe en la ruta: ${imagePath}`);
      return null;
    }

    let quality = 90;
    let buffer;
    let metadata;

    do {
      // Procesar imagen con sharp
      buffer = await sharp(imagePath)
        .resize(1500, 1500, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();

      // Obtener metadata
      metadata = await sharp(buffer).metadata();

      // Si el tamaño es mayor al deseado, reducir calidad
      if (buffer.length > maxSizeKB * 1024 && quality > 10) {
        quality -= 10;
      } else {
        break;
      }
    } while (true);

    return {
      buffer,
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    console.error("Error comprimiendo imagen:", error);
    return null;
  }
};

export const generateExcelReport = async (req, res) => {
  try {
    const { inventoryIds } = req.body;

    // Verificar que se proporcionaron IDs
    if (!inventoryIds || !Array.isArray(inventoryIds)) {
      return res
        .status(400)
        .json({ error: "Se requiere un array de IDs de inventario" });
    }

    // Obtener inventarios con sus relaciones
    const inventories = await db.inventory.findMany({
      where: {
        id: { in: inventoryIds },
      },
      include: {
        model: {
          include: {
            brand: true,
            type: true,
          },
        },
        images: true,
      },
    });

    // Crear workbook
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Inventarios");

    // Configurar columnas
    ws.columns = [
      { header: "Marca", key: "brand", width: 15 },
      { header: "Tipo", key: "type", width: 15 },
      { header: "Modelo", key: "model", width: 25 },
      { header: "Número de Serie", key: "serial", width: 20 },
      { header: "Número de Activo", key: "active", width: 20 },
      { header: "Estado", key: "status", width: 15 },
      { header: "F. Creación", key: "createdAt", width: 15 },
      { header: "F. Actualización", key: "updatedAt", width: 15 },
      { header: "Imagen", key: "img", width: 12 },
    ];

    let rowIdx = 2;
    for (const inv of inventories) {
      ws.addRow({
        brand: inv.model?.brand?.name || "",
        type: inv.model?.type?.name || "",
        model: inv.model?.name || "",
        serial: inv.serialNumber || "",
        active: inv.activeNumber || "",
        status: inv.status || "",
        createdAt: new Date(inv.createdAt).toLocaleDateString(),
        updatedAt: new Date(inv.updatedAt).toLocaleDateString(),
      });

      // Procesar primera imagen si existe
      if (inv.images?.[0]) {
        try {
          const imagePath = path.join(__dirname, "..", inv.images[0].url);
          const result = await compressImage(imagePath);

          if (result) {
            const imageId = wb.addImage({
              buffer: result.buffer,
              extension: "jpeg",
            });

            ws.addImage(imageId, {
              tl: { col: 8, row: rowIdx - 1 },
              ext: { width: 64, height: 64 },
            });

            ws.getRow(rowIdx).height = 48;
          } else {
            // Si no se pudo procesar la imagen, añadir una nota en la celda
            ws.getCell(`I${rowIdx}`).value = "Imagen no disponible";
            ws.getCell(`I${rowIdx}`).alignment = {
              vertical: "middle",
              horizontal: "center",
            };
          }
        } catch (error) {
          console.error("Error procesando imagen:", error);
          // En caso de error, añadir una nota en la celda
          ws.getCell(`I${rowIdx}`).value = "Error al cargar imagen";
          ws.getCell(`I${rowIdx}`).alignment = {
            vertical: "middle",
            horizontal: "center",
          };
        }
      } else {
        // Si no hay imagen, indicarlo en la celda
        ws.getCell(`I${rowIdx}`).value = "Sin imagen";
        ws.getCell(`I${rowIdx}`).alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      }

      rowIdx++;
    }

    // Generar buffer
    const buffer = await wb.xlsx.writeBuffer();

    // Enviar archivo
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Baja_de_equipos_${new Date()
        .toISOString()
        .replace(/[:-]/g, "_")}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error generando reporte Excel:", error);
    res.status(500).json({ error: "Error generando reporte Excel" });
  }
};

export const generateWordReport = async (req, res) => {
  try {
    const { inventoryIds } = req.body;

    // Verificar que se proporcionaron IDs
    if (!inventoryIds || !Array.isArray(inventoryIds)) {
      return res
        .status(400)
        .json({ error: "Se requiere un array de IDs de inventario" });
    }

    // Obtener inventarios con sus relaciones
    const inventories = await db.inventory.findMany({
      where: {
        id: { in: inventoryIds },
      },
      include: {
        model: {
          include: {
            brand: true,
            type: true,
          },
        },
        images: true,
      },
    });

    const sections = [];

    // Procesar cada inventario
    for (const inventory of inventories) {
      const children = [];

      // Encabezado
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${inventory.model?.brand?.name || ""} ${
                inventory.model?.type?.name || ""
              } ${inventory.model?.name || ""}`,
              bold: true,
              size: 32,
            }),
          ],
          spacing: { after: 400 },
          alignment: AlignmentType.CENTER,
        })
      );

      // Tabla de información
      const infoRows = [
        createTableRow("Número de Serie", inventory.serialNumber || ""),
        createTableRow("Número de Activo", inventory.activeNumber || ""),
        createTableRow("Estado", inventory.status || ""),
        createTableRow(
          "F. Creación",
          new Date(inventory.createdAt).toLocaleDateString()
        ),
        createTableRow(
          "F. Actualización",
          new Date(inventory.updatedAt).toLocaleDateString()
        ),
      ];

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideHorizontal: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "000000",
            },
            insideVertical: {
              style: BorderStyle.SINGLE,
              size: 1,
              color: "000000",
            },
          },
          rows: infoRows,
        })
      );

      // Espaciado
      children.push(new Paragraph({ spacing: { after: 200 } }));

      // Procesar imágenes
      if (inventory.images?.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Imágenes del Equipo",
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 400, after: 200 },
          })
        );

        const processedImages = [];

        // Procesar todas las imágenes
        for (const image of inventory.images) {
          try {
            const imagePath = path.join(__dirname, "..", image.url);
            const { buffer, width, height } = await compressImage(imagePath);

            processedImages.push({
              data: buffer,
              width,
              height,
            });
          } catch (error) {
            console.error("Error procesando imagen:", error);
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
                width: { size: 33, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      img
                        ? new ImageRun({
                            data: img.data,
                            transformation: {
                              width: 200,
                              height: 150,
                            },
                          })
                        : new TextRun("Sin imagen"),
                    ],
                  }),
                ],
              });
            }),
          });

          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE },
              },
              rows: [tableRow],
              spacing: { after: 200 },
              alignment: AlignmentType.CENTER,
            })
          );
        }
      }

      // Agregar sección
      sections.push({
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      });
    }

    // Crear documento
    const doc = new Document({ sections });

    // Generar buffer
    const buffer = await Packer.toBuffer(doc);

    // Enviar archivo
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Baja_de_equipos_${new Date()
        .toISOString()
        .replace(/[:-]/g, "_")}.docx`
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error generando reporte Word:", error);
    res.status(500).json({ error: "Error generando reporte Word" });
  }
};

// Función auxiliar para crear filas de tabla
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
        children: [new Paragraph({ text: value ?? "" })],
      }),
    ],
  });
}
