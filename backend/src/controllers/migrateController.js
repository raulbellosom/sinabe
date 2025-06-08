import { db } from "../lib/db.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

// (Opcional) Ignorar errores de certificado en desarrollo
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Directorios para guardar recursos
const IMAGES_DIR = path.join("src", "uploads", "inventories", "images");
const THUMBNAILS_DIR = path.join(IMAGES_DIR, "thumbnails");
const FILES_DIR = path.join("src", "uploads", "inventories", "files");

// Helper para convertir ruta local a URL pública (quita "src")
const getPublicUrl = (localPath) => {
  return localPath.replace(/^src[\/\\]/, "");
};

// Helper para descargar un archivo (imagen o file)
const downloadFile = async (fileUrl, destPath) => {
  const response = await axios({
    url: fileUrl,
    method: "GET",
    responseType: "stream",
  });
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);
    writer.on("finish", () => resolve(destPath));
    writer.on("error", reject);
  });
};

// Helper para procesar una imagen: genera un thumbnail y retorna ambas rutas
const processImage = async (imagePath, fileName) => {
  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
  }
  const thumbnailPath = path.join(THUMBNAILS_DIR, `${fileName}-thumbnail.jpg`);
  await sharp(imagePath).resize(150, 150).toFile(thumbnailPath);
  return {
    url: imagePath, // ruta local
    thumbnail: thumbnailPath,
  };
};

// Función de transformación para adaptar el JSON recibido al formato que usaremos
const transformInventory = (oldInventory) => {
  const baseUrl = "";
  return {
    serialNumber: oldInventory.serialNumber,
    activeNumber: oldInventory.activeNumber || oldInventory.activo,
    status: oldInventory.status, // Se espera 1, 2 o 3
    images: Array.isArray(oldInventory.images)
      ? oldInventory.images.map((img) => ({
          url:
            img.url && img.url.startsWith("http")
              ? img.url
              : baseUrl + (img.url || ""),
          thumbnail:
            img.thumbnail && img.thumbnail.startsWith("http")
              ? img.thumbnail
              : baseUrl + (img.thumbnail || ""),
        }))
      : [],
    files: Array.isArray(oldInventory.files)
      ? oldInventory.files
          // Filtra para descartar elementos sin información
          .filter((file) => {
            const fileUrl = (file.url || "").trim();
            const fileName = (file.file?.name || "").trim();
            return fileUrl !== "" || fileName !== "";
          })
          .map((file) => ({
            url:
              file.url && file.url.startsWith("http")
                ? file.url
                : baseUrl + (file.url || ""),
            name: file.name || file.file?.name || "",
            type: file.type || file.file?.type || "",
            metadata: {
              name: file.file?.name || "",
              path: file.file?.path || "",
              size: file.file?.size || 0,
              type: file.file?.type || "",
              lastModified: file.file?.lastModified || 0,
              lastModifiedDate: file.file?.lastModifiedDate || "",
              webkitRelativePath: file.file?.webkitRelativePath || "",
            },
          }))
      : [],
    altaDate: oldInventory.altaDate,
    bajaDate: oldInventory.bajaDate,
    receptionDate: oldInventory.receptionDate,
    createdAt: oldInventory.createdAt,
    updatedAt: oldInventory.updatedAt,
    comments: oldInventory.comments,
    inventoryModel: {
      name: oldInventory.inventoryModel?.name,
      inventoryBrand: {
        name: oldInventory.inventoryModel?.inventoryBrand?.name,
      },
      inventoryType: {
        name: oldInventory.inventoryModel?.inventoryType?.name,
      },
    },
    customFields: Array.isArray(oldInventory.customFields)
      ? oldInventory.customFields.map((cf) => ({
          customField: cf.customField,
          customFieldValue: cf.customFieldValue,
        }))
      : [],
  };
};

// Controlador para migrar un inventario a partir del JSON enviado en req.body.inventory
export const migrateInventory = async (req, res) => {
  try {
    // Se espera que el body tenga { inventory: { ... } }
    const { inventory } = req.body;
    if (!inventory) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron datos de inventario." });
    }

    // Extraer valores de inventoryModel
    const modelName = inventory.inventoryModel?.name;
    const modelBrand = inventory.inventoryModel?.inventoryBrand?.name;
    const modelType = inventory.inventoryModel?.inventoryType?.name;
    if (!modelName || !modelBrand || !modelType) {
      return res.status(400).json({
        message:
          "Faltan campos obligatorios: modelName, modelBrand, modelType o serialNumber.",
      });
    }

    // Verificar que el serialNumber no exista (usando findFirst)
    if (inventory?.serialNumber) {
      const existing = await db.inventory.findFirst({
        where: { serialNumber: inventory.serialNumber, enabled: true },
      });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Ya existe un inventario con ese serialNumber." });
      }
    }

    // Buscar o crear InventoryBrand
    let brand = await db.inventoryBrand.findFirst({
      where: { name: modelBrand },
    });
    if (!brand) {
      brand = await db.inventoryBrand.create({
        data: { name: modelBrand, enabled: true },
      });
    }

    // Buscar o crear InventoryType
    let type = await db.inventoryType.findFirst({
      where: { name: modelType },
    });
    if (!type) {
      type = await db.inventoryType.create({
        data: { name: modelType, enabled: true },
      });
    }

    // Buscar o crear el modelo (Model) usando brandId y typeId
    let model = await db.model.findFirst({
      where: {
        name: modelName,
        brandId: brand.id,
        typeId: type.id,
      },
    });
    if (!model) {
      model = await db.model.create({
        data: {
          name: modelName,
          brand: { connect: { id: brand.id } },
          type: { connect: { id: type.id } },
          enabled: true,
        },
      });
    }

    // Transformar el inventario recibido
    const transformed = transformInventory(inventory);

    // Procesar imágenes
    let imageRecords = [];
    if (transformed.images && Array.isArray(transformed.images)) {
      if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
      }
      for (const img of transformed.images) {
        const imageId = uuidv4();
        const imageFileName = `${imageId}.jpg`;
        const imageDestPath = path.join(IMAGES_DIR, imageFileName);
        try {
          await downloadFile(img.url, imageDestPath);
          const processed = await processImage(imageDestPath, imageId);
          imageRecords.push({
            // Convertir la ruta local en URL pública
            url: getPublicUrl(processed.url),
            thumbnail: getPublicUrl(processed.thumbnail),
            type: "image/jpeg",
            enabled: true,
          });
        } catch (error) {
          console.error(`Error procesando imagen ${img.url}:`, error.message);
        }
      }
    }

    // Procesar archivos
    let fileRecords = [];
    if (transformed.files && Array.isArray(transformed.files)) {
      if (!fs.existsSync(FILES_DIR)) {
        fs.mkdirSync(FILES_DIR, { recursive: true });
      }
      for (const fileObj of transformed.files) {
        const fileId = uuidv4();
        const ext = path.extname(fileObj.name) || ".dat";
        const fileFileName = `${fileId}${ext}`;
        const fileDestPath = path.join(FILES_DIR, fileFileName);
        try {
          await downloadFile(fileObj.url, fileDestPath);
          fileRecords.push({
            url: getPublicUrl(fileDestPath),
            metadata: fileObj.metadata,
            type: fileObj.type,
            name: fileObj.name,
          });
        } catch (error) {
          console.error(
            `Error procesando archivo ${fileObj.url}:`,
            error.message
          );
        }
      }
    }

    // Se asume que req.user.id está disponible (o asigna un valor por defecto para pruebas)
    const createdById = req.user?.id || "some-default-user-id";

    // Función helper para mapear el valor numérico de status al enum correspondiente
    const getStatusEnum = (statusValue) => {
      const allowed = ["ALTA", "PROPUESTA", "BAJA"];
      if (allowed.includes(statusValue)) {
        return statusValue;
      }
      throw new Error(`Valor de status inválido: ${statusValue}`);
    };

    // Crear el inventario en la base de datos
    const createdInventory = await db.inventory.create({
      data: {
        serialNumber: transformed.serialNumber,
        activeNumber: transformed.activeNumber,
        status: getStatusEnum(transformed.status),
        receptionDate: transformed.receptionDate
          ? new Date(transformed.receptionDate)
          : null,
        altaDate: transformed.altaDate ? new Date(transformed.altaDate) : null,
        bajaDate: transformed.bajaDate ? new Date(transformed.bajaDate) : null,
        createdAt: transformed.createdAt
          ? new Date(transformed.createdAt)
          : new Date(),
        updatedAt: transformed.updatedAt
          ? new Date(transformed.updatedAt)
          : new Date(),
        comments: transformed.comments,
        modelId: model.id,
        enabled: true,
        createdById, // Asignamos el creador
      },
    });

    // Guardar imágenes en la tabla Image
    for (const img of imageRecords) {
      await db.image.create({
        data: {
          inventoryId: createdInventory.id,
          url: img.url,
          thumbnail: img.thumbnail,
          type: img.type,
          enabled: true,
        },
      });
    }

    // Guardar archivos en la tabla File
    for (const f of fileRecords) {
      await db.file.create({
        data: {
          inventoryId: createdInventory.id,
          url: f.url,
          metadata: { ...f.metadata, name: f?.metadata?.name || f.name },
          type: f.type,
        },
      });
    }

    // Procesar y guardar custom fields
    if (transformed.customFields && Array.isArray(transformed.customFields)) {
      for (const cf of transformed.customFields) {
        let customField = await db.customField.findFirst({
          where: { name: cf.customField, enabled: true },
        });
        if (!customField) {
          customField = await db.customField.create({
            data: { name: cf.customField, enabled: true },
          });
        }
        await db.inventoryCustomField.create({
          data: {
            inventoryId: createdInventory.id,
            customFieldId: customField.id,
            value: cf.customFieldValue || "",
          },
        });
      }
    }

    return res.status(200).json({
      message: "Inventario migrado exitosamente.",
      inventory: createdInventory,
    });
  } catch (error) {
    console.error("Error migrando inventario:", error);
    return res.status(500).json({
      message: "Error migrando inventario.",
      error: error.message,
    });
  }
};
