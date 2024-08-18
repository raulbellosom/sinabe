import { db } from "../lib/db.js";

import axios from "axios";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { v4 as uuidv4 } from "uuid";
import { parse, format } from "date-fns";
import { es } from "date-fns/locale";

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

const convertDateFormat = (dateStr) => {
  try {
    const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date(), { locale: es });

    return format(parsedDate, "MM/dd/yyyy");
  } catch (error) {
    console.error("Error al convertir la fecha:", error);
    throw new Error("Fecha inválida");
  }
};

export const createMultipleVehicles = async (req, res) => {
  const csvFile = req.file;
  const user = req.user;

  if (!csvFile) {
    return res.status(400).json({ message: "No se subió ningún archivo." });
  }

  const vehicles = [];
  const errors = [];
  const images = [];

  try {
    // Leer y parsear el archivo CSV
    fs.createReadStream(csvFile.path)
      .pipe(csvParser())
      .on("data", (row) => {
        // Aquí mapear los campos del CSV a los campos de tu modelo
        vehicles.push({
          model: row["Nombre del Modelo"],
          economicNumber: row["Número Económico"],
          serialNumber: row["Número de Serie"],
          plateNumber: row["Número de Placa"],
          mileage: parseInt(row["Kilometraje"], 10),
          acquisitionDate: convertDateFormat(row["Fecha de Adquisición"]),
          cost: parseFloat(row["Costo de Adquisición"]),
          status: row["Estado"] === "true",
          comments: row["Observaciones"],
          images: row["Imágenes"], // Aquí se asume que las URLs de las imágenes están en una sola columna separadas por comas
        });
      })
      .on("end", async () => {
        const userId = req.user.id;
        const validatedVehicles = [];

        // console.log("vehicles", vehicles);
        for (const [index, vehicle] of vehicles.entries()) {
          // Aquí se mantiene la lógica de validación y procesamiento de imágenes que ya tienes
          // console.log("vehicle", vehicle);
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
            errors.push(
              `Fila ${index + 1}: El campo 'cost' debe ser un número`
            );
            continue;
          }

          if (vehicle.mileage && isNaN(parseInt(vehicle.mileage, 10))) {
            errors.push(
              `Fila ${index + 1}: El campo 'mileage' debe ser un número entero`
            );
            continue;
          }

          if (vehicle.status && typeof vehicle.status !== "boolean") {
            errors.push(
              `Fila ${index + 1}: El campo 'status' debe ser un booleano`
            );
            continue;
          }

          if (
            vehicle.acquisitionDate &&
            isNaN(Date.parse(vehicle.acquisitionDate))
          ) {
            errors.push(
              `Fila ${
                index + 1
              }: El campo 'acquisitionDate' debe ser una fecha válida`
            );
            continue;
          }

          // Buscar el ID del modelo basado en el nombre
          const model = await db.model.findFirst({
            where: { name: vehicle.model },
          });
          if (!model) {
            errors.push(
              `Fila ${index + 1}: El modelo '${vehicle.model}' no existe`
            );
            continue;
          }

          // Validar que createdById exista
          const userExists = await db.user.findFirst({
            where: { id: user.id },
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
            const imageUrls = vehicle.images.split(","); // Separar las URLs por comas
            for (const imageUrl of imageUrls) {
              try {
                const imageId = uuidv4();
                const imagePath = path.join(
                  `${BASE_PATH}images/`,
                  `${imageId}.jpg`
                );
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

          try {
            // Crear el vehículo individualmente para obtener el ID
            const createdVehicle = await db.vehicle.create({
              data: {
                ...vehicle,
                createdById: user.id,
                modelId: model.id,
                enabled: true,
                model: undefined,
                acquisitionDate: new Date(vehicle.acquisitionDate),
                images: undefined,
              },
            });

            // Crear imágenes asociadas al vehículo
            if (imagePaths.length > 0) {
              await db.image.createMany({
                data: imagePaths.map((image) => ({
                  vehicleId: createdVehicle.id,
                  path: image.url,
                  thumbnail: image.thumbnail,
                  medium: image.medium,
                  large: image.large,
                })),
              });
            }
          } catch (error) {
            errors.push(
              `Fila ${index + 1}: Error al crear el vehículo: ${error.message}`
            );
          }
        }

        if (errors.length > 0) {
          return res
            .status(400)
            .json({ message: "Errores de validación", errors });
        }
        // get all vehicles
        const getAllVehicles = await db.vehicle.findMany({
          include: {
            model: {
              include: {
                brand: true,
                type: true,
              },
            },
            conditions: {
              include: {
                condition: true,
              },
            },
            images: true,
            files: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        res.status(200).json({
          message: "Vehículos creados exitosamente.",
          data: getAllVehicles,
        });
      });
  } catch (error) {
    console.error("Error al procesar el archivo CSV:", error);
    res.status(500).json({ message: "Error al procesar el archivo CSV." });
  }
};
