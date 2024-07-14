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
  const {
    typeId,
    brandId,
    year,
    modelId,
    modelName,
    acquisitionDate,
    cost,
    mileage,
    status,
  } = req.body;
  const user = req.user;

  const model = await db.model.findUnique({
    where: { id: parseInt(modelId, 10) },
  });

  if (!model) {
    try {
      await db.model.create({
        data: {
          brandId,
          typeId,
          year,
          name: modelName,
        },
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  }

  try {
    const vehicle = await db.vehicle.create({
      data: {
        modelId: parseInt(modelId, 10),
        acquisitionDate: new Date(acquisitionDate),
        cost,
        mileage,
        status,
        createdById: user.id,
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
  const {
    typeId,
    brandId,
    modelId,
    year,
    modelName,
    acquisitionDate,
    cost,
    mileage,
    status,
  } = req.body;

  const model = await db.model.findUnique({
    where: { id: parseInt(modelId, 10) },
  });

  if (!model) {
    try {
      await db.model.update({
        where: { id: parseInt(modelId, 10) },
        data: {
          brandId,
          typeId,
          year,
        },
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  }

  try {
    const vehicle = await db.vehicle.update({
      where: { id },
      data: {
        modelId: parseInt(modelId, 10),
        acquisitionDate: new Date(acquisitionDate),
        cost,
        mileage,
        status,
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

export const getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await db.vehicleType.findMany();
    res.json(vehicleTypes);
  } catch (error) {
    console.log(error.message);
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
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleBrands = async (req, res) => {
  try {
    const vehicleBrands = await db.vehicleBrand.findMany();
    res.json(vehicleBrands);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleBrandById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleBrand = await db.vehicleBrand.findUnique({
      where: { id },
    });

    if (vehicleBrand) {
      res.json(vehicleBrand);
    } else {
      res.status(404).json({ message: "Vehicle brand not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleModels = async (req, res) => {
  try {
    const vehicleModels = await db.model.findMany();
    res.json(vehicleModels);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleModelById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleModel = await db.model.findUnique({
      where: { id },
    });

    if (vehicleModel) {
      res.json(vehicleModel);
    } else {
      res.status(404).json({ message: "Vehicle model not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
