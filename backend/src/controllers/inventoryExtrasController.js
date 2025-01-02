import csvParser from "csv-parser";
import fs from "fs";
import sharp from "sharp";

export const createMultipleInventories = async (req, res) => {
  try {
    const csvFile = req.file;
    const userName = req.user.userName; // Nombre del usuario actual
    const currentDate = new Date();

    // Leer el archivo CSV
    if (!csvFile) {
      return res.status(400).json({ message: "No se subió ningún archivo." });
    }

    const inventories = [];
    const errors = [];

    fs.createReadStream(csvFile.path)
      .pipe(csvParser())
      .on("data", async (row) => {
        try {
          // Verificar si el createdBy existe en la base de datos
          let createdById = await getUserIdByUserName(row.createdBy);
          if (!createdById) createdById = await getUserIdByUserName("root"); // Asignar root si no existe

          // Procesar las fechas
          const altaDate = row.altaDate ? new Date(row.altaDate) : currentDate;
          const bajaDate = row.bajaDate ? new Date(row.bajaDate) : currentDate;
          const recepcionDate = row.recepcionDate
            ? new Date(row.recepcionDate)
            : currentDate;
          const createdAt = row.createdAt
            ? new Date(row.createdAt)
            : currentDate;
          const updatedAt = row.updatedAt
            ? new Date(row.updatedAt)
            : currentDate;

          // Procesar imágenes
          const images = row.images_clean ? JSON.parse(row.images_clean) : [];
          const imageFiles = await processImages(images);

          // Crear el inventario en la base de datos
          const inventory = {
            id: row.id,
            modelId: parseInt(row.inventoryModelId),
            serialNumber: row.serialNumber || null,
            activeNumber: row.activo || null,
            comments: row.comments || null,
            status: row.status_label, // Este campo es para el status
            createdById: createdById,
            altaDate: altaDate,
            bajaDate: bajaDate,
            recepcionDate: recepcionDate,
            createdAt: createdAt,
            updatedAt: updatedAt,
            details: row.details_clean ? JSON.parse(row.details_clean) : null,
            images: imageFiles, // Imágenes procesadas
            files: [], // Se pueden agregar archivos si son proporcionados
          };

          inventories.push(inventory);
        } catch (err) {
          errors.push(`Error al procesar la fila: ${err.message}`);
        }
      })
      .on("end", async () => {
        // Guardar los inventarios procesados en la base de datos
        try {
          await saveInventories(inventories);
          const successMessage = `Se crearon ${inventories.length} registros correctamente.`;
          return res.json({ successMessage, errors });
        } catch (err) {
          console.error(err);
          return res.status(500).json({ message: err.message });
        }
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Función para buscar el usuario por su userName
const getUserIdByUserName = async (userName) => {
  // Aquí deberías implementar la lógica para buscar el ID del usuario
  // Si el usuario no existe, devolverá null
  const user = await User.findOne({ where: { userName } });
  return user ? user.id : null;
};

// Función para procesar las imágenes
const processImages = async (imageUrls) => {
  const imageFiles = [];
  for (let url of imageUrls) {
    // Descargar la imagen de la URL y procesarla
    const buffer = await downloadImage(url); // Implementa la lógica para descargar la imagen
    const imageFile = await sharp(buffer)
      .resize(200) // Ejemplo: Redimensionar la imagen
      .toBuffer();

    // Guardar la imagen en la base de datos
    const image = await Image.create({
      data: imageFile,
      url: url,
    });

    imageFiles.push(image);
  }
  return imageFiles;
};

// Función para descargar imágenes (esto puede requerir ajustes según tu caso)
const downloadImage = async (url) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  return buffer;
};

// Función para guardar los inventarios en la base de datos
const saveInventories = async (inventories) => {
  for (let inventory of inventories) {
    await Inventory.create(inventory);
  }
};
