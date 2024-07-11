import { db } from "../lib/db.js";

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await db.vehicle.findMany();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id },
    });

    if (vehicle) {
      res.json(vehicle);
    } else {
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createVehicle = async (req, res) => {
  const { typeId, brand, model, acquisitionDate, cost, mileage, status } =
    req.body;
  const user = req.user;

  try {
    const vehicle = await db.vehicle.create({
      data: {
        typeId: parseInt(typeId, 10),
        brand,
        model,
        acquisitionDate: new Date(acquisitionDate),
        cost,
        mileage,
        status,
        createdById: user.id,
      },
    });

    console.log(vehicle);

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { typeId, brand, model, acquisitionDate, cost, mileage, status } =
    req.body;

  try {
    const vehicle = await db.vehicle.update({
      where: { id },
      data: {
        typeId,
        brand,
        model,
        acquisitionDate: new Date(acquisitionDate),
        cost,
        mileage,
        status,
      },
    });

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  try {
    await db.vehicle.delete({
      where: { id },
    });

    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await db.vehicleType.findMany();
    res.json(vehicleTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleType = await db.vehicleType.findUnique({
      where: { id },
    });

    if (vehicleType) {
      res.json(vehicleType);
    } else {
      res.status(404).json({ message: "Vehicle type not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
