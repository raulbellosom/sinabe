import { db } from "../lib/db.js";

export const getInventoryTypes = async (req, res) => {
  try {
    const inventoryTypes = await db.inventoryType.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        models: {
          include: {
            _count: {
              select: {
                inventories: {
                  where: {
                    enabled: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const inventoryTypesWithCount = inventoryTypes.map((type) => {
      const inventoryCount = type.models.reduce(
        (acc, model) => acc + model._count.inventories,
        0
      );
      return {
        id: type.id,
        name: type.name,
        count: inventoryCount,
      };
    });

    res.json(inventoryTypesWithCount);
  } catch (error) {
    console.log("error on getInventoryTypes", error);
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const inventoryType = await db.inventoryType.findUnique({
      where: { id, enabled: true },
      include: {
        models: {
          include: {
            _count: {
              select: {
                inventories: {
                  where: {
                    enabled: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (inventoryType) {
      const inventoryTypeWithCount = {
        id: inventoryType.id,
        name: inventoryType.name,
        count: inventoryType.models.reduce(
          (acc, model) => acc + model._count.inventories,
          0
        ),
      };
      res.json(inventoryTypeWithCount);
    } else {
      res.status(404).json({ message: "Inventory type not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createInventoryType = async (req, res) => {
  const { name } = req.body;

  try {
    const inventoryType = await db.inventoryType.findFirst({
      where: { name, enabled: true },
    });

    if (inventoryType) {
      return res.status(400).json({ message: "Type already exists" });
    }

    const newInventoryType = await db.inventoryType.create({
      data: {
        name,
        enabled: true,
      },
    });

    const inventoryTypeWithCount = {
      id: newInventoryType.id,
      name: newInventoryType.name,
      count: 0,
    };

    res.status(201).json(inventoryTypeWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateInventoryType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const inventoryType = await db.inventoryType.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!inventoryType) {
      return res.status(404).json({ message: "Type not found" });
    }

    const updatedInventoryType = await db.inventoryType.update({
      where: { id: parseInt(id, 10), enabled: true },
      data: {
        name,
      },
      include: {
        models: {
          include: {
            _count: {
              select: {
                inventories: {
                  where: {
                    enabled: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const inventoryTypeWithCount = {
      id: updatedInventoryType.id,
      name: updatedInventoryType.name,
      count: updatedInventoryType.models.reduce(
        (acc, model) => acc + model._count.inventories,
        0
      ),
    };

    res.json(inventoryTypeWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteInventoryType = async (req, res) => {
  const { id } = req.params;

  try {
    const inventoryType = await db.inventoryType.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!inventoryType) {
      return res.status(404).json({ message: "Type not found" });
    }

    await db.inventoryType.update({
      where: { id: parseInt(id, 10) },
      data: {
        enabled: false,
      },
    });

    const data = await db.inventoryType.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        models: {
          include: {
            _count: {
              select: {
                inventories: {
                  where: {
                    enabled: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const inventoryTypesWithCount = data.map((type) => ({
      id: type.id,
      name: type.name,
      count: type.models.reduce(
        (acc, model) => acc + model._count.inventories,
        0
      ),
    }));

    res.json({ data: inventoryTypesWithCount, message: "Type deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryBrands = async (req, res) => {
  try {
    const inventoryBrands = await db.inventoryBrand.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        models: {
          include: {
            _count: {
              select: { inventories: true },
            },
          },
        },
      },
    });

    const inventoryBrandsWithCount = inventoryBrands.map((brand) => {
      const inventoryCount = brand.models.reduce(
        (acc, model) => acc + model._count.inventories,
        0
      );
      return {
        id: brand.id,
        name: brand.name,
        count: inventoryCount,
      };
    });

    res.json(inventoryBrandsWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryBrandById = async (req, res) => {
  const { id } = req.params;

  try {
    const inventoryBrand = await db.inventoryBrand.findUnique({
      where: { id: parseInt(id), enabled: true },
      include: {
        models: {
          include: {
            _count: {
              select: {
                inventories: {
                  where: {
                    enabled: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const inventoryBrandWithCount = {
      id: inventoryBrand.id,
      name: inventoryBrand.name,
      count: inventoryBrand.models.reduce(
        (acc, model) => acc + model._count.inventories,
        0
      ),
    };

    if (inventoryBrandWithCount) {
      res.json(inventoryBrandWithCount);
    } else {
      res.status(404).json({ message: "Inventory brand not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createInventoryBrand = async (req, res) => {
  const { name } = req.body;

  try {
    const inventoryBrand = await db.inventoryBrand.findFirst({
      where: { name, enabled: true },
    });

    if (inventoryBrand) {
      return res.status(400).json({ message: "Brand already exists" });
    }

    const newInventoryBrand = await db.inventoryBrand.create({
      data: {
        name,
        enabled: true,
      },
    });

    const inventoryBrandWithCount = {
      id: newInventoryBrand.id,
      name: newInventoryBrand.name,
      count: 0,
    };

    res.status(201).json(inventoryBrandWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateInventoryBrand = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const inventoryBrand = await db.inventoryBrand.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!inventoryBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const updatedInventoryBrand = await db.inventoryBrand.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
      },
      include: {
        models: {
          include: {
            _count: {
              select: {
                inventories: {
                  where: {
                    enabled: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const inventoryBrandWithCount = {
      id: updatedInventoryBrand.id,
      name: updatedInventoryBrand.name,
      count: updatedInventoryBrand.models.reduce(
        (acc, model) => acc + model._count.inventories,
        0
      ),
    };

    res.json(inventoryBrandWithCount);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteInventoryBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const inventoryBrand = await db.inventoryBrand.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
    });

    if (!inventoryBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    await db.inventoryBrand.update({
      where: { id: parseInt(id, 10) },
      data: {
        enabled: false,
      },
    });

    const inventoryBrands = await db.inventoryBrand.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        models: {
          include: {
            _count: {
              select: {
                inventories: {
                  where: {
                    enabled: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const inventoryBrandsWithCount = inventoryBrands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      count: brand.models.reduce(
        (acc, model) => acc + model._count.inventories,
        0
      ),
    }));

    res.json({ data: inventoryBrandsWithCount, message: "Brand deleted" });
  } catch (error) {
    console.log("error on deleteInventoryBrand", error);
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryModels = async (req, res) => {
  try {
    const inventoryModels = await db.model.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      include: {
        brand: true,
        type: true,
        inventories: {
          where: { enabled: true },
          select: { id: true },
        },
      },
    });

    const inventoryModelsWithCount = inventoryModels.map((model) => ({
      id: model.id,
      name: model.name,
      brandId: model.brandId,
      typeId: model.typeId,
      brandName: model.brand.name,
      typeName: model.type.name,
      brand: model.brand,
      type: model.type,
      count: model.inventories.length,
    }));

    res.json(inventoryModelsWithCount);
  } catch (error) {
    console.log("error on getInventoryModels", error);
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryModelById = async (req, res) => {
  const { id } = req.params;

  try {
    const inventoryModel = await db.model.findUnique({
      where: { id: parseInt(id, 10), enabled: true },
      include: {
        brand: true,
        type: true,
      },
    });

    if (inventoryModel) {
      res.json(inventoryModel);
    } else {
      res.status(404).json({ message: "Inventory model not found" });
    }
  } catch (error) {
    console.log("error on getInventoryModelById", error);
    res.status(500).json({ message: error.message });
  }
};

export const createInventoryModel = async (req, res) => {
  const { name, brandId, typeId } = req.body;

  try {
    const model = await db.model.findFirst({
      where: {
        name,
        brandId: parseInt(brandId, 10),
        typeId: parseInt(typeId, 10),
        enabled: true,
      },
    });

    if (model) {
      return res.status(400).json({ message: "Model already exists" });
    }

    const brand = await db.inventoryBrand.findUnique({
      where: { id: parseInt(brandId, 10), enabled: true },
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const type = await db.inventoryType.findUnique({
      where: { id: parseInt(typeId, 10), enabled: true },
    });

    if (!type) {
      return res.status(404).json({ message: "Type not found" });
    }

    const inventoryModel = await db.model.create({
      data: {
        name,
        brandId: parseInt(brandId, 10),
        typeId: parseInt(typeId, 10),
        enabled: true,
      },
      include: {
        brand: true,
        type: true,
      },
    });

    res.status(201).json(inventoryModel);
  } catch (error) {
    console.log("error on createInventoryModel", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateInventoryModel = async (req, res) => {
  const { id } = req.params;
  const { name, brandId, typeId } = req.body;

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
      },
      include: {
        brand: true,
        type: true,
      },
    });

    res.json(updatedModel);
  } catch (error) {
    console.log("error on updateInventoryModel", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteInventoryModel = async (req, res) => {
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
    console.log("error on deleteInventoryModel", error);
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
    const validSortFields = ["name", "brand.name", "type.name"];

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
        inventories: {
          where: { enabled: true },
          select: { id: true },
        },
      },
      skip: skip,
      take: take === 0 ? undefined : take,
    });

    const modelsWithCount = models.map((model) => ({
      ...model,
      inventoryCount: model.inventories.length,
    }));

    const totalRecords = await db.model.count({
      where: whereConditions,
    });

    const totalPages = Math.ceil(totalRecords / pageSize);

    res.json({
      data: modelsWithCount,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page),
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
        inventories: {
          select: { id: true },
        },
      },
    });

    const conditionsWithCount = conditions.map((condition) => ({
      id: condition.id,
      name: condition.name,
      count: condition.inventories.length,
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
        inventories: {
          select: { id: true },
        },
      },
    });

    if (condition) {
      const conditionWithCount = {
        id: condition.id,
        name: condition.name,
        count: condition.inventories.length,
      };

      res.json(conditionWithCount);
    } else {
      res.status(404).json({ message: "Condition not found" });
    }
  } catch (error) {
    console.log("error on getConditionById", error);
    res.status(500).json({ message: error.message });
  }
};

export const createCondition = async (req, res) => {
  const { name } = req.body;

  try {
    const condition = await db.condition.findFirst({
      where: { name, enabled: true },
      include: {
        inventories: {
          select: { id: true },
        },
      },
    });

    if (condition) {
      const conditionWithCount = {
        id: condition.id,
        name: condition.name,
        count: condition.inventories.length,
      };

      return res.status(400).json({
        data: conditionWithCount,
        message: "La condición ya existe",
      });
    }

    const newCondition = await db.condition.create({
      data: {
        name,
        enabled: true,
      },
      include: {
        inventories: {
          select: { id: true },
        },
      },
    });

    const conditionWithCount = {
      id: newCondition.id,
      name: newCondition.name,
      count: newCondition.inventories.length,
    };

    res.status(201).json(conditionWithCount);
  } catch (error) {
    console.log("error on createCondition", error);
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
      return res
        .status(404)
        .json({ message: "La condición no fue encontrada." });
    }

    const updatedCondition = await db.condition.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
      },
      include: {
        inventories: {
          select: { id: true },
        },
      },
    });

    const conditionWithCount = {
      id: updatedCondition.id,
      name: updatedCondition.name,
      count: updatedCondition.inventories.length,
    };

    res.json(conditionWithCount);
  } catch (error) {
    console.log("error on updateCondition", error);
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
      return res.status(404).json({ message: "Condición no encontrada." });
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
        inventories: {
          select: { id: true },
        },
      },
    });

    const conditionsWithCount = data.map((condition) => ({
      id: condition.id,
      name: condition.name,
      count: condition.inventories.length,
    }));

    res.json({ data: conditionsWithCount, message: "Condition deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
