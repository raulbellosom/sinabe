import { db } from "../lib/db.js";

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

export const createVehicleType = async (req, res) => {
  const { name } = req.body;

  try {
    const vehicleType = await db.vehicleType.findFirst({
      where: { name },
    });

    if (vehicleType) {
      return res.status(400).json({ message: "Type already exists" });
    }

    const newVehicleType = await db.vehicleType.create({
      data: {
        name,
      },
    });

    res.status(201).json(newVehicleType);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateVehicleType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const vehicleType = await db.vehicleType.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!vehicleType) {
      return res.status(404).json({ message: "Type not found" });
    }

    const updatedVehicleType = await db.vehicleType.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
      },
    });

    res.json(updatedVehicleType);
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

export const createVehicleBrand = async (req, res) => {
  const { name } = req.body;

  try {
    const vehicleBrand = await db.vehicleBrand.findFirst({
      where: { name },
    });

    if (vehicleBrand) {
      return res.status(400).json({ message: "Brand already exists" });
    }

    const newVehicleBrand = await db.vehicleBrand.create({
      data: {
        name,
      },
    });

    res.status(201).json(newVehicleBrand);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateVehicleBrand = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const vehicleBrand = await db.vehicleBrand.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!vehicleBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const updatedVehicleBrand = await db.vehicleBrand.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
      },
    });

    res.json(updatedVehicleBrand);
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

export const createVehicleModel = async (req, res) => {
  const { name, brandId, typeId, year } = req.body;

  try {
    const model = await db.model.findFirst({
      where: {
        name,
        brandId,
        typeId,
        year,
      },
    });

    if (model) {
      return res.status(400).json({ message: "Model already exists" });
    }

    const brand = await db.vehicleBrand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const type = await db.vehicleType.findUnique({
      where: { id: typeId },
    });

    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }

    const vehicleModel = await db.model.create({
      data: {
        name,
        brandId,
        typeId,
        year,
      },
    });

    res.status(201).json(vehicleModel);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateVehicleModel = async (req, res) => {
  const { id } = req.params;
  const { name, brandId, typeId, year } = req.body;

  try {
    const model = await db.model.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }

    const updatedModel = await db.model.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        brandId,
        typeId,
        year,
      },
    });

    res.json(updatedModel);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteVehicleModel = async (req, res) => {
  const { id } = req.params;

  try {
    const model = await db.model.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }

    await db.model.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: "Model deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
