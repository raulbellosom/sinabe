import { db } from "../lib/db.js";

export const getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await db.vehicleType.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        models: {
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        },
      },
    });
    const vehicleTypesWithCount = vehicleTypes.map((type) => {
      const vehicleCount = type.models.reduce(
        (acc, model) => acc + model._count.vehicles,
        0
      );
      return {
        id: type.id,
        name: type.name,
        economicGroup: type.economicGroup,
        count: vehicleCount,
      };
    });

    res.json(vehicleTypesWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleType = await db.vehicleType.findUnique({
      where: { id, enabled: true },
      include: {
        models: {
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        },
      },
    });

    if (vehicleType) {
      const vehicleTypeWithCount = {
        id: vehicleType.id,
        name: vehicleType.name,
        count: vehicleType.models.reduce(
          (acc, model) => acc + model._count.vehicles,
          0
        ),
      };
      res.json(vehicleTypeWithCount);
    } else {
      res.status(404).json({ message: "Vehicle type not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createVehicleType = async (req, res) => {
  const { name, economicGroup } = req.body;

  try {
    const vehicleType = await db.vehicleType.findFirst({
      where: { name, economicGroup, enabled: true },
    });

    if (vehicleType) {
      return res.status(400).json({ message: "Type already exists" });
    }

    const newVehicleType = await db.vehicleType.create({
      data: {
        name,
        economicGroup,
        enabled: true,
      },
    });

    const vehicleTypeWithCount = {
      id: newVehicleType.id,
      name: newVehicleType.name,
      economicGroup: newVehicleType.economicGroup,
      count: 0,
    };

    res.status(201).json(vehicleTypeWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateVehicleType = async (req, res) => {
  const { id } = req.params;
  const { name, economicGroup } = req.body;

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
        economicGroup,
      },
      include: {
        models: {
          include: {
            vehicles: {
              where: {
                enabled: true,
              },
              select: {
                _count: true,
              },
            },
          },
        },
      },
    });

    const vehicleTypeWithCount = {
      id: updatedVehicleType.id,
      name: updatedVehicleType.name,
      economicGroup: updatedVehicleType.economicGroup,
      count: updatedVehicleType.models.reduce(
        (acc, model) => acc + model._count.vehicles,
        0
      ),
    };

    res.json(vehicleTypeWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteVehicleType = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleType = await db.vehicleType.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!vehicleType) {
      return res.status(404).json({ message: "Type not found" });
    }

    await db.vehicleType.update({
      where: { id: parseInt(id, 10) },
      data: {
        enabled: false,
      },
    });

    const data = await db.vehicleType.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        models: {
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        },
      },
    });

    const vehicleTypesWithCount = data.map((type) => ({
      id: type.id,
      name: type.name,
      economicGroup: type.economicGroup,
      count: type.models.reduce((acc, model) => acc + model._count.vehicles, 0),
    }));

    res.json({ data: vehicleTypesWithCount, message: "Type deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleBrands = async (req, res) => {
  try {
    const vehicleBrands = await db.vehicleBrand.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        models: {
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        },
      },
    });

    const vehicleBrandsWithCount = vehicleBrands.map((brand) => {
      const vehicleCount = brand.models.reduce(
        (acc, model) => acc + model._count.vehicles,
        0
      );
      return {
        id: brand.id,
        name: brand.name,
        count: vehicleCount,
      };
    });

    res.json(vehicleBrandsWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleBrandById = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleBrand = await db.vehicleBrand.findUnique({
      where: { id: parseInt(id), enabled: true },
      include: {
        models: {
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        },
      },
    });

    const vehicleBrandWithCount = {
      id: vehicleBrand.id,
      name: vehicleBrand.name,
      count: vehicleBrand.models.reduce(
        (acc, model) => acc + model._count.vehicles,
        0
      ),
    };

    if (vehicleBrandWithCount) {
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
      where: { name, enabled: true },
    });

    if (vehicleBrand) {
      return res.status(400).json({ message: "Brand already exists" });
    }

    const newVehicleBrand = await db.vehicleBrand.create({
      data: {
        name,
        enabled: true,
      },
    });

    const vehicleBrandWithCount = {
      id: newVehicleBrand.id,
      name: newVehicleBrand.name,
      count: 0,
    };

    res.status(201).json(vehicleBrandWithCount);
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
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!vehicleBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const updatedVehicleBrand = await db.vehicleBrand.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
      },
      include: {
        models: {
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        },
      },
    });

    const vehicleBrandWithCount = {
      id: updatedVehicleBrand.id,
      name: updatedVehicleBrand.name,
      count: updatedVehicleBrand.models.reduce(
        (acc, model) => acc + model._count.vehicles,
        0
      ),
    };

    res.json(vehicleBrandWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteVehicleBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleBrand = await db.vehicleBrand.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!vehicleBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    await db.vehicleBrand.update({
      where: { id: parseInt(id, 10) },
      data: {
        enabled: false,
      },
    });

    const vehicleBrands = await db.vehicleBrand.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        models: {
          include: {
            _count: {
              select: { vehicles: true },
            },
          },
        },
      },
    });

    const vehicleBrandsWithCount = vehicleBrands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      count: brand.models.reduce(
        (acc, model) => acc + model._count.vehicles,
        0
      ),
    }));

    res.json({ data: vehicleBrandsWithCount, message: "Brand deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getVehicleModels = async (req, res) => {
  try {
    const vehicleModels = await db.model.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        brand: true,
        type: true,
      },
    });
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
      where: { id: parseInt(id, 10), enabled: true },
      include: {
        brand: true,
        type: true,
      },
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
        brandId: parseInt(brandId, 10),
        typeId: parseInt(typeId, 10),
        year: parseInt(year, 10),
        enabled: true,
      },
    });

    if (model) {
      return res.status(400).json({ message: "Model already exists" });
    }

    const brand = await db.vehicleBrand.findUnique({
      where: { id: parseInt(brandId, 10), enabled: true },
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const type = await db.vehicleType.findUnique({
      where: { id: parseInt(typeId, 10), enabled: true },
    });

    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }

    const vehicleModel = await db.model.create({
      data: {
        name,
        brandId: parseInt(brandId, 10),
        typeId: parseInt(typeId, 10),
        year: parseInt(year, 10),
        enabled: true,
      },
      include: {
        brand: true,
        type: true,
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
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }

    const updatedModel = await db.model.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        brandId: parseInt(brandId, 10),
        typeId: parseInt(typeId, 10),
        year: parseInt(year, 10),
      },
      include: {
        brand: true,
        type: true,
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
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }

    await db.model.update({
      where: { id: parseInt(id, 10), enabled: true },
      orderBy: { name: "asc" },
      data: {
        enabled: false,
      },
    });

    const models = await db.model.findMany({
      where: { enabled: true },
      include: {
        brand: true,
        type: true,
      },
    });

    res.json({ data: models, message: "Model deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const searchModels = async (req, res) => {
  const {
    searchTerm,
    sortBy = "name",
    order = "asc",
    page = 1,
    pageSize = 10,
  } = req.query;

  try {
    const validSortFields = ["name", "year", "brand.name", "type.name"];

    const orderField = validSortFields.includes(sortBy) ? sortBy : "name";
    const orderDirection = order === "desc" ? "desc" : "asc";

    const formSortBy = (value, order) => {
      let arr = value.split(".");
      let obj = {};
      if (arr.length === 3) {
        obj = {
          [arr[0]]: {
            [arr[1]]: {
              [arr[2]]: order,
            },
          },
        };
      } else if (arr.length === 2) {
        obj = {
          [arr[0]]: {
            [arr[1]]: order,
          },
        };
      } else {
        obj = {
          [arr[0]]: order,
        };
      }
      return obj;
    };

    const textSearchConditions = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm } },
            { brand: { name: { contains: searchTerm } } },
            { type: { name: { contains: searchTerm } } },
          ],
        }
      : {};

    const skip = (page - 1) * pageSize;
    const take = parseInt(pageSize);

    const whereConditions = {
      enabled: true,
      ...textSearchConditions,
    };

    const models = await db.model.findMany({
      where: whereConditions,
      orderBy: formSortBy(orderField, orderDirection),
      include: {
        brand: true,
        type: true,
      },
      skip,
      take,
    });

    const totalRecords = await db.model.count({
      where: whereConditions,
    });

    const totalPages = Math.ceil(totalRecords / pageSize);

    res.json({
      data: models,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page),
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getConditions = async (req, res) => {
  try {
    const conditions = await db.condition.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        vehicles: {
          select: { id: true },
        },
      },
    });

    const conditionsWithCount = conditions.map((condition) => ({
      id: condition.id,
      name: condition.name,
      count: condition.vehicles.length,
    }));

    res.json(conditionsWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getConditionById = async (req, res) => {
  const { id } = req.params;

  try {
    const condition = await db.condition.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
      include: {
        vehicles: {
          select: { id: true },
        },
      },
    });

    if (condition) {
      const conditionWithCount = {
        id: condition.id,
        name: condition.name,
        count: condition.vehicles.length,
      };

      res.json(conditionWithCount);
    } else {
      res.status(404).json({ message: "Condition not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createCondition = async (req, res) => {
  const { name } = req.body;

  try {
    const condition = await db.condition.findFirst({
      where: { name, enabled: true },
      include: {
        vehicles: {
          select: { id: true },
        },
      },
    });

    if (condition) {
      const conditionWithCount = {
        id: condition.id,
        name: condition.name,
        count: condition.vehicles.length,
      };

      return res.status(400).json({
        data: conditionWithCount,
        message: "Condition already exists",
      });
    }

    const newCondition = await db.condition.create({
      data: {
        name,
        enabled: true,
      },
      include: {
        vehicles: {
          select: { id: true },
        },
      },
    });

    const conditionWithCount = {
      id: newCondition.id,
      name: newCondition.name,
      count: newCondition.vehicles.length,
    };

    res.status(201).json(conditionWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateCondition = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const condition = await db.condition.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!condition) {
      return res.status(404).json({ message: "Condition not found" });
    }

    const updatedCondition = await db.condition.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
      },
      include: {
        vehicles: {
          select: { id: true },
        },
      },
    });

    const conditionWithCount = {
      id: updatedCondition.id,
      name: updatedCondition.name,
      count: updatedCondition.vehicles.length,
    };

    res.json(conditionWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteCondition = async (req, res) => {
  const { id } = req.params;

  try {
    const condition = await db.condition.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!condition) {
      return res.status(404).json({ message: "Condition not found" });
    }

    await db.condition.update({
      where: { id: parseInt(id, 10) },
      data: {
        enabled: false,
      },
    });

    const data = await db.condition.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        vehicles: {
          select: { id: true },
        },
      },
    });

    const conditionsWithCount = data.map((condition) => ({
      id: condition.id,
      name: condition.name,
      count: condition.vehicles.length,
    }));

    res.json({ data: conditionsWithCount, message: "Condition deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
