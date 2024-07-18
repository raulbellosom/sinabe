import { db } from "../lib/db.js";

const parseStatus = (status) => status === "true";

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await db.vehicle.findMany({
      where: { enabled: true },
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
        conditions: {
          include: {
            condition: true,
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
  const {
    modelId,
    acquisitionDate,
    cost,
    mileage,
    status,
    comments,
    conditions,
  } = req.body;
  const user = req.user;

  try {
    const createdVehicle = await db.$transaction(async (prisma) => {
      const vehicle = await prisma.vehicle.create({
        data: {
          modelId: parseInt(modelId, 10),
          acquisitionDate: new Date(acquisitionDate),
          cost,
          mileage,
          status: parseStatus(status),
          createdById: user.id,
          comments,
          enabled: true,
        },
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
        },
      });

      if (conditions && conditions.length > 0) {
        const conditionData = conditions.map((conditionId) => ({
          vehicleId: vehicle.id,
          conditionId: parseInt(conditionId, 10),
        }));

        await prisma.vehicleCondition.createMany({
          data: conditionData,
        });
      }

      return vehicle;
    });

    res.status(201).json(createdVehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error.message);
    res.status(500).json({ message: "Failed to create vehicle" });
  } finally {
    await db.$disconnect();
  }
};

export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const {
    modelId,
    comments,
    acquisitionDate,
    cost,
    mileage,
    status,
    conditions,
  } = req.body;

  try {
    const model = await db.model.findUnique({
      where: { id: parseInt(modelId, 10) },
    });

    if (!model) {
      res.status(404).json({ message: "Model not found" });
      return;
    }

    const updatedVehicle = await db.$transaction(async (prisma) => {
      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: {
          modelId: parseInt(modelId, 10),
          comments,
          acquisitionDate: new Date(acquisitionDate),
          cost,
          mileage,
          status: parseStatus(status),
        },
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
        },
      });

      if (conditions && conditions.length > 0) {
        await prisma.vehicleCondition.deleteMany({
          where: { vehicleId: vehicle.id },
        });

        const conditionData = conditions.map((conditionId) => ({
          vehicleId: vehicle.id,
          conditionId: parseInt(conditionId, 10),
        }));

        await prisma.vehicleCondition.createMany({
          data: conditionData,
        });
      }

      return vehicle;
    });

    res.json(updatedVehicle);
  } catch (error) {
    console.error("Error updating vehicle:", error.message);
    res.status(500).json({ message: "Failed to update vehicle" });
  } finally {
    await db.$disconnect();
  }
};

export const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  try {
    await db.vehicle.update({
      where: { id },
      data: { enabled: false },
    });

    const vehicles = await db.vehicle.findMany({
      where: { id: { not: id }, enabled: true },
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
      },
    });

    res.json({ data: vehicles, message: "Vehicle deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
