import { db } from "../lib/db.js";

import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";
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
    if (!dateStr || dateStr.trim() === "") {
      return null;
    }

    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateStr.trim())) {
      console.error(`Formato de fecha inválido: ${dateStr}`);
      return null;
    }

    const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date(), { locale: es });

    if (isNaN(parsedDate)) {
      console.error(`Fecha inválida tras el parseo: ${dateStr}`);
      return null;
    }

    return format(parsedDate, "MM/dd/yyyy");
  } catch (error) {
    console.error("Error al convertir la fecha:", error);
    return null;
  }
};

const parseImages = (rawImages) => {
  try {
    if (rawImages.startsWith("'") && rawImages.endsWith("'")) {
      rawImages = rawImages.slice(1, -1);
    }

    rawImages = rawImages.replace(/'/g, '"');

    console.log("Raw images string:", rawImages);

    const parsedImages = JSON.parse(rawImages);

    return Array.isArray(parsedImages) ? parsedImages : [];
  } catch (error) {
    console.error("Error parsing images:", error);
    console.error("Problematic JSON string:", rawImages);
    return [];
  }
};

const validateNotEmpty = (value, fieldName, errors, index) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (typeof value === "number" && isNaN(value))
  ) {
    errors.push(`Fila ${index + 1}: El campo '${fieldName}' es obligatorio`);
  }
};

const validateFields = (vehicle, userId, index, errors) => {
  validateNotEmpty(vehicle.model, "Nombre del Modelo", errors, index);
  validateNotEmpty(vehicle.year, "Año del Modelo", errors, index);
  validateNotEmpty(vehicle.brand, "Marca del Vehículo", errors, index);
  validateNotEmpty(vehicle.type, "Tipo de Vehículo", errors, index);
  validateNotEmpty(vehicle.mileage, "Kilometraje", errors, index);
  validateNotEmpty(
    vehicle.acquisitionDate,
    "Fecha de Adquisición",
    errors,
    index
  );
  validateNotEmpty(vehicle.cost, "Costo de Adquisición", errors, index);
  validateNotEmpty(vehicle.status, "Estado", errors, index);

  if (vehicle.cost && isNaN(parseFloat(vehicle.cost))) {
    errors.push(
      `Fila ${index + 1}: El campo 'Costo del Vehículo' debe ser un número`
    );
  }

  if (vehicle.mileage && isNaN(parseInt(vehicle.mileage, 10))) {
    errors.push(
      `Fila ${index + 1}: El campo 'Kilometraje' debe ser un número entero`
    );
  }

  if (vehicle.status && typeof vehicle.status !== "boolean") {
    errors.push(`Fila ${index + 1}: El campo 'Estado' debe ser un booleano`);
  }

  if (vehicle.acquisitionDate && isNaN(Date.parse(vehicle.acquisitionDate))) {
    errors.push(
      `Fila ${
        index + 1
      }: El campo 'Fecha de Adquisición' debe ser una fecha válida`
    );
  }

  if (!userId) {
    errors.push(
      `Fila ${
        index + 1
      }: El usuario no es válido, por favor inicie sesión nuevamente`
    );
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
  const successfulVehicles = [];

  try {
    fs.createReadStream(csvFile.path)
      .pipe(csvParser())
      .on("data", (row) => {
        const parsedImages = parseImages(row["Imágenes"] || "[]");
        vehicles.push({
          model: row["Nombre del Modelo"],
          year: parseInt(row["Año del Modelo"], 10),
          brand: row["Marca del Vehículo"],
          type: row["Tipo de Vehículo"],
          economicNumber: row["Número Económico"],
          serialNumber: row["Número de Serie"],
          plateNumber: row["Número de Placa"],
          mileage: parseInt(row["Kilometraje"], 10),
          acquisitionDate: convertDateFormat(row["Fecha de Adquisición"]),
          cost: parseFloat(row["Costo de Adquisición"]),
          status: row["Estado"] === "true",
          comments: row["Comentarios"],
          images: parsedImages.join(","),
        });
      })
      .on("end", async () => {
        const userId = user?.id;
        for (const [index, vehicle] of vehicles.entries()) {
          validateFields(vehicle, userId, index, errors);

          const model = await db.model.findFirst({
            where: {
              name: vehicle.model,
              year: vehicle.year || undefined,
              brand: {
                name: vehicle.brand,
              },
              type: {
                name: vehicle.type,
              },
            },
          });
          if (!model) {
            errors.push(
              `Fila ${index + 1}: El modelo '${vehicle.model}' no existe`
            );
            continue;
          }

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

          let imagePaths = [];
          if (vehicle.images) {
            const imageUrls = vehicle.images.split(",");
            for (const imageUrl of imageUrls) {
              try {
                const imageId = uuidv4();
                const imagePath = path.join(
                  `${BASE_PATH}images/`,
                  `${imageId}.jpg`
                );
                await downloadImage(imageUrl.trim(), imagePath);

                const processedImages = await processImage(imagePath, imageId);
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
            delete vehicle.model;
            delete vehicle.year;
            delete vehicle.brand;
            delete vehicle.type;

            const createdVehicle = await db.vehicle.create({
              data: {
                ...vehicle,
                createdById: user.id,
                modelId: model.id,
                enabled: true,
                acquisitionDate: new Date(vehicle.acquisitionDate),
                images: undefined,
              },
              include: {
                model: {
                  include: {
                    brand: true,
                    type: true,
                  },
                },
              },
            });

            if (imagePaths.length > 0) {
              await db.image.createMany({
                data: imagePaths.map((image) => ({
                  vehicleId: createdVehicle.id,
                  url: image.url,
                  type: "image/jpeg",
                  thumbnail: image.thumbnail,
                  medium: image.medium,
                  large: image.large,
                  enabled: true,
                })),
              });
            }

            successfulVehicles.push(createdVehicle);
          } catch (error) {
            errors.push(
              `Fila ${index + 1}: Error al crear el vehículo: ${error.message}`
            );
          }
        }

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

        const responsePayload = {
          message:
            errors.length > 0
              ? "Algunos vehículos no pudieron ser creados"
              : "Vehículos creados exitosamente.",
          createdVehicles: successfulVehicles,
          data: getAllVehicles,
          errors: errors.length > 0 ? errors : null,
        };

        if (errors.length > 0 && successfulVehicles.length === 0) {
          return res.status(400).json(responsePayload);
        } else if (errors.length > 0 && successfulVehicles.length > 0) {
          return res.status(200).json(responsePayload);
        } else {
          return res.status(200).json(responsePayload);
        }
      });
  } catch (error) {
    console.error("Error al procesar el archivo CSV:", error);
    res.status(500).json({ message: "Error al procesar el archivo CSV." });
  }
};
