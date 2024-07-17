import { db } from "../lib/db.js";

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await db.vehicle.findMany({
      include: {
        model: {
          include: {
            brand: true,
            type: true,
          },
        },
      },
    });
    res.json(vehicles);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            brand: true,
            type: true,
          },
        },
      },
    });

    if (vehicle) {
      res.json(vehicle);
    } else {
      console.log(error.message);
      res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createVehicle = async (req, res) => {
  const { modelId, acquisitionDate, cost, mileage, status, comments } =
    req.body;
  const user = req.user;

  try {
    const model = await db.model.findUnique({
      where: { id: parseInt(modelId, 10) },
    });

    if (!model) {
      res.status(404).json({ message: "Model not found" });
      return;
    }

    const vehicle = await db.vehicle.create({
      data: {
        modelId: parseInt(modelId, 10),
        acquisitionDate: new Date(acquisitionDate),
        cost,
        mileage,
        status,
        createdById: user.id,
        comments,
      },
    });

    const newVehicle = await db.vehicle.findUnique({
      where: { id: vehicle.id },
      include: {
        model: {
          include: {
            brand: true,
            type: true,
          },
        },
      },
    });

    res.status(201).json(newVehicle);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { modelId, comments, acquisitionDate, cost, mileage, status } =
    req.body;

  try {
    const model = await db.model.findUnique({
      where: { id: parseInt(modelId, 10) },
    });

    if (!model) {
      res.status(404).json({ message: "Model not found" });
      return;
    }

    await db.vehicle.update({
      where: { id },
      data: {
        modelId: parseInt(modelId, 10),
        acquisitionDate: new Date(acquisitionDate),
        cost,
        mileage,
        status,
        comments,
      },
    });

    const updatedVehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            brand: true,
            type: true,
          },
        },
      },
    });

    res.json(updatedVehicle);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  try {
    await db.vehicle.delete({
      where: { id },
    });

    const vehicles = await db.vehicle.findMany({
      where: { id: { not: id } },
      include: {
        model: {
          include: {
            brand: true,
            type: true,
          },
        },
      },
    });

    res.json({ data: vehicles, message: "Vehicle deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
