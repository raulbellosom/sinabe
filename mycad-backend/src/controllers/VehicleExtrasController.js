import { db } from "../lib/db.js";

import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const BASE_PATH = "src/uploads/vehicles/";

const downloadImage = async (url, dest) => {
  const response = await axios({
    url,
    responseType: "stream",
  });

  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(dest);
    response.data.pipe(fileStream);

    fileStream.on("finish", () => resolve(dest));
    fileStream.on("error", reject);
  });
};

const processImage = async (imagePath, fileName) => {
  const thumbnailDir = `${BASE_PATH}images/thumbnails/`;
  const mediumDir = `${BASE_PATH}images/medium/`;
  const largeDir = `${BASE_PATH}images/large/`;

  const thumbnailPath = `${thumbnailDir}${fileName}-thumbnail.jpg`;
  const mediumPath = `${mediumDir}${fileName}-medium.jpg`;
  const largePath = `${largeDir}${fileName}-large.jpg`;

  if (!fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir, { recursive: true });
  }
  if (!fs.existsSync(mediumDir)) {
    fs.mkdirSync(mediumDir, { recursive: true });
  }
  if (!fs.existsSync(largeDir)) {
    fs.mkdirSync(largeDir, { recursive: true });
  }

  await sharp(imagePath).resize(150, 150).toFile(thumbnailPath);
  await sharp(imagePath).resize(500, 500).toFile(mediumPath);
  await sharp(imagePath).resize(1000, 1000).toFile(largePath);

  let urlRelativePath = BASE_PATH.replace("src/", "");
  return {
    url: `${urlRelativePath}images/${fileName}.jpg`,
    thumbnail: thumbnailPath.split("src/")[1],
    medium: mediumPath.split("src/")[1],
    large: largePath.split("src/")[1],
  };
};

export const createMultipleVehicles = async (req, res) => {
  const vehicles = req.body.vehicles;
  const userId = req.user.id;
  const errors = [];
  const validatedVehicles = [];

  for (const [index, vehicle] of vehicles.entries()) {
    // Validaciones anteriores (las mantengo tal cual)

    if (
      !vehicle.acquisitionDate ||
      !vehicle.cost ||
      !vehicle.mileage ||
      vehicle.status === undefined ||
      !userId ||
      !vehicle.model
    ) {
      errors.push(`Fila ${index + 1}: Faltan campos obligatorios`);
      continue;
    }

    if (vehicle.cost && isNaN(parseFloat(vehicle.cost))) {
      errors.push(`Fila ${index + 1}: El campo 'cost' debe ser un número`);
      continue;
    }

    if (vehicle.mileage && isNaN(parseInt(vehicle.mileage, 10))) {
      errors.push(
        `Fila ${index + 1}: El campo 'mileage' debe ser un número entero`
      );
      continue;
    }

    if (vehicle.status && typeof vehicle.status !== "boolean") {
      errors.push(`Fila ${index + 1}: El campo 'status' debe ser un booleano`);
      continue;
    }

    if (vehicle.acquisitionDate && isNaN(Date.parse(vehicle.acquisitionDate))) {
      errors.push(
        `Fila ${
          index + 1
        }: El campo 'acquisitionDate' debe ser una fecha válida`
      );
      continue;
    }

    // Buscar el ID del modelo basado en el nombre
    const model = await db.model.findUnique({
      where: { name: vehicle.model },
    });
    if (!model) {
      errors.push(`Fila ${index + 1}: El modelo '${vehicle.model}' no existe`);
      continue;
    }

    // Validar que createdById exista
    const userExists = await db.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      errors.push(
        `Fila ${
          index + 1
        }: El usuario no es válido, por favor inicie sesión nuevamente`
      );
      continue;
    }

    // Procesar las URLs de las imágenes y guardarlas en el servidor
    let imagePaths = [];
    if (vehicle.images) {
      const imageUrls = vehicle.images.split(","); // Separar las URLs por comas (o el delimitador que uses)
      for (const imageUrl of imageUrls) {
        try {
          const imageId = uuidv4();
          const imagePath = path.join(`${BASE_PATH}images/`, `${imageId}.jpg`); // Ruta donde se guardará la imagen original
          await downloadImage(imageUrl.trim(), imagePath);

          const processedImages = await processImage(imagePath, imageId); // Procesar las versiones de la imagen
          imagePaths.push(processedImages);
        } catch (error) {
          errors.push(
            `Fila ${
              index + 1
            }: Error al descargar la imagen desde la URL '${imageUrl}'`
          );
        }
      }
    }

    // Agregar el vehículo validado a la lista, incluyendo las rutas de las imágenes procesadas
    validatedVehicles.push({
      ...vehicle,
      modelId: model.id, // Reemplaza el nombre del modelo por su ID
      images: imagePaths, // Guardar las rutas de las versiones de las imágenes
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Errores de validación", errors });
  }

  try {
    const createdVehicles = await db.vehicle.createMany({
      data: validatedVehicles,
      skipDuplicates: true,
    });

    // Guardar las imágenes en la base de datos
    for (const vehicle of validatedVehicles) {
      const vehicleRecord = await db.vehicle.findUnique({
        where: { modelId: vehicle.modelId },
      });

      await db.image.createMany({
        data: vehicle.images.map((image) => ({
          vehicleId: vehicleRecord.id,
          path: image.url,
          thumbnail: image.thumbnail,
          medium: image.medium,
          large: image.large,
        })),
      });
    }

    res.status(200).json(createdVehicles);
  } catch (error) {
    console.error("Error al cargar los vehículos:", error);
    res.status(500).json({ message: "Error al cargar los vehículos" });
  }
};
