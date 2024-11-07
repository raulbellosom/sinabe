import { db } from "../lib/db.js";

export const getInventories = async (req, res) => {
  try {
    const inventories = await db.inventory.findMany({
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
        customField: {
          include: {
            customField: true,
          },
        },
        files: {
          where: { enabled: true },
        },
        images: {
          where: { enabled: true },
          select: {
            url: true,
            type: true,
            thumbnail: true,
            metadata: true,
          },
        },
      },
    });
    res.json(inventories);
  } catch (error) {
    console.log("Error fetching inventories:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const inventory = await db.inventory.findUnique({
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
        customField: {
          include: {
            customField: true,
          },
        },
        files: {
          where: { enabled: true },
          select: {
            id: true,
            url: true,
            type: true,
            metadata: true,
          },
        },
        images: {
          where: { enabled: true },
          select: {
            id: true,
            url: true,
            type: true,
            thumbnail: true,
            metadata: true,
          },
        },
      },
    });

    if (inventory) {
      inventory.receptionDate
        ? (inventory.receptionDate = inventory.receptionDate
            .toISOString()
            .split("T")[0])
        : null;
      res.json(inventory);
    } else {
      console.log("Inventory not found");
      res.status(404).json({ message: "Inventory not found" });
    }
  } catch (error) {
    console.log("Error fetching inventory:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createInventory = async (req, res) => {
  try {
    const { inventory } = req.body;
    const user = req.user;
    const inventoryData = JSON.parse(inventory);
    const {
      modelId,
      receptionDate,
      comments,
      conditions,
      activeNumber,
      serialNumber,
      details,
      customFields,
      status,
    } = inventoryData;

    const createdInventory = await db.$transaction(async (prisma) => {
      const inventory = await prisma.inventory.create({
        data: {
          modelId: parseInt(modelId, 10),
          activeNumber,
          serialNumber,
          receptionDate: new Date(receptionDate),
          comments,
          status,
          createdById: user.id,
          details,
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
          customField: {
            include: {
              customField: true,
            },
          },
          images: true,
          files: true,
        },
      });

      if (conditions && conditions.length > 0) {
        const conditionData = conditions.map((conditionId) => ({
          inventoryId: inventory.id,
          conditionId: parseInt(conditionId, 10),
        }));

        await prisma.inventoryCondition.createMany({
          data: conditionData,
        });
      }

      if (customFields && customFields.length > 0) {
        const customFieldData = customFields.map(
          ({ customFieldId, value }) => ({
            inventoryId: inventory.id,
            customFieldId: parseInt(customFieldId, 10),
            value,
          })
        );

        await prisma.inventoryCustomField.createMany({
          data: customFieldData,
        });
      }

      if (req.processedFiles && req.processedFiles.length > 0) {
        const imageData = req.processedFiles.map((file) => ({
          url: file.url,
          type: file.type,
          thumbnail: file.thumbnail,
          inventoryId: inventory.id,
          enabled: true,
        }));

        await prisma.image.createMany({
          data: imageData,
        });
      }

      if (req.files && req.files.length > 0) {
        const fileData = req.files.map((file) => ({
          url: file.url,
          type: file.type,
          inventoryId: inventory.id,
          metadata: file.metadata,
          enabled: true,
        }));

        await prisma.file.createMany({
          data: fileData,
        });
      }

      return inventory;
    });

    if (createdInventory) {
      createdInventory.receptionDate
        ? (createdInventory.receptionDate = createdInventory.receptionDate
            .toISOString()
            .split("T")[0])
        : null;
      res.status(201).json(createdInventory);
    } else {
      console.log("Inventory not found");
      res.status(404).json({ message: "Inventory not found" });
    }
  } catch (error) {
    console.error("Error creating inventory:", error.message);
    res.status(500).json({ message: "Failed to create inventory" });
  } finally {
    await db.$disconnect();
  }
};

export const updateInventory = async (req, res) => {
  const { id } = req.params;
  const {
    modelId,
    receptionDate,
    comments,
    conditions,
    activeNumber,
    serialNumber,
    details,
    customFields,
    images,
    files,
  } = JSON.parse(req.body.inventory || "{}");

  try {
    const model = await db.model.findUnique({
      where: { id: parseInt(modelId, 10) },
    });

    if (!model) {
      res.status(404).json({ message: "Model not found" });
      return;
    }

    await db.$transaction(async (prisma) => {
      await prisma.inventory.update({
        where: { id },
        data: {
          modelId: parseInt(modelId, 10),
          activeNumber,
          serialNumber,
          receptionDate: new Date(receptionDate),
          comments,
          details,
        },
      });

      if (conditions && conditions.length > 0) {
        await prisma.inventoryCondition.deleteMany({
          where: { inventoryId: id },
        });

        const conditionData = conditions.map((conditionId) => ({
          inventoryId: id,
          conditionId: parseInt(conditionId, 10),
        }));

        await prisma.inventoryCondition.createMany({
          data: conditionData,
        });
      }

      if (customFields && customFields.length > 0) {
        await prisma.inventoryCustomField.deleteMany({
          where: { inventoryId: id },
        });

        const customFieldData = customFields.map(
          ({ customFieldId, value }) => ({
            inventoryId: id,
            customFieldId: parseInt(customFieldId, 10),
            value,
          })
        );

        await prisma.inventoryCustomField.createMany({
          data: customFieldData,
        });
      }

      const currentImages = new Set();
      images.forEach((element) => {
        if (element.id) {
          currentImages.add(element.id);
        }
      });

      await prisma.image.updateMany({
        where: {
          inventoryId: id,
          id: { notIn: Array.from(currentImages) },
        },
        data: { enabled: false },
      });

      if (req.processedFiles && req.processedFiles.length > 0) {
        const imageData = req.processedFiles.map((file) => ({
          url: file.url,
          type: file.type,
          thumbnail: file.thumbnail,
          inventoryId: id,
          metadata: file.metadata,
          enabled: true,
        }));

        await prisma.image.createMany({
          data: imageData,
        });
      }

      const currentFiles = new Set();
      files.forEach((element) => {
        if (element.id) {
          currentFiles.add(element.id);
        }
      });

      await prisma.file.updateMany({
        where: {
          inventoryId: id,
          id: { notIn: Array.from(currentFiles) },
        },
        data: { enabled: false },
      });

      if (req.files && req.files.length > 0) {
        const fileData = req.files.map((file) => ({
          url: file.url,
          type: file.type,
          inventoryId: id,
          metadata: file.metadata,
          enabled: true,
        }));

        await prisma.file.createMany({
          data: fileData,
        });
      }
    });

    const updatedInventory = await db.inventory.findUnique({
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
        customField: {
          include: {
            customField: true,
          },
        },
        images: {
          where: { enabled: true },
          select: {
            id: true,
            url: true,
            type: true,
            thumbnail: true,
            metadata: true,
          },
        },
        files: {
          where: { enabled: true },
          select: {
            id: true,
            url: true,
            type: true,
            metadata: true,
          },
        },
      },
    });

    if (updatedInventory) {
      updatedInventory.receptionDate
        ? (updatedInventory.receptionDate = updatedInventory.receptionDate
            .toISOString()
            .split("T")[0])
        : null;
      res.status(201).json(updatedInventory);
    } else {
      console.log("Inventory not found");
      res.status(404).json({ message: "Inventory not found" });
    }
  } catch (error) {
    console.error("Error updating inventory:", error.message);
    res.status(500).json({ message: "Failed to update inventory" });
  } finally {
    await db.$disconnect();
  }
};

export const deleteInventory = async (req, res) => {
  const { id } = req.params;

  try {
    await db.inventory.update({
      where: { id },
      data: { enabled: false },
    });

    const inventories = await db.inventory.findMany({
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
        customField: {
          include: {
            customField: true,
          },
        },
        files: {
          where: { enabled: true },
        },
        images: {
          where: { enabled: true },
          select: {
            url: true,
            type: true,
            thumbnail: true,
            metadata: true,
          },
        },
      },
    });

    res.json({ data: inventories, message: "Inventario eliminado." });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const searchInventories = async (req, res) => {
  try {
    const {
      searchTerm,
      sortBy = "createdAt",
      order = "asc",
      page = 1,
      pageSize = 10,
      conditionName,
      deepSearch = [],
    } = req.query;

    const validSortFields = [
      "createdAt",
      "status",
      "model.name",
      "model.brand.name",
      "model.type.name",
      "activeNumber",
      "serialNumber",
    ];

    const mapSearchHeaderToColumn = (searchHeader) => {
      const columnsMap = {
        "model.name": "model.name",
        "model.type.name": "model.type.name",
        "model.brand.name": "model.brand.name",
        activeNumber: "activeNumber",
        serialNumber: "serialNumber",
        comments: "comments",
      };
      return columnsMap[searchHeader] || null;
    };

    const buildDeepSearchConditions = (deepSearchArray) => {
      const conditions = [];

      deepSearchArray.forEach(
        ({ searchHeader, searchTerm, searchCriteria }) => {
          const column = mapSearchHeaderToColumn(searchHeader);

          if (!column || typeof column !== "string") return;

          const path = column.split(".");
          let condition = {};

          switch (searchCriteria) {
            case "equals":
              condition = { [path[path.length - 1]]: { equals: searchTerm } };
              break;
            case "startsWith":
              condition = {
                [path[path.length - 1]]: { startsWith: searchTerm },
              };
              break;
            case "endsWith":
              condition = {
                [path[path.length - 1]]: { endsWith: searchTerm },
              };
              break;
            case "contains":
              condition = { [path[path.length - 1]]: { contains: searchTerm } };
              break;
            case "different":
              condition = { [path[path.length - 1]]: { not: searchTerm } };
              break;
            case "greater":
              condition = {
                [path[path.length - 1]]: { gt: Number(searchTerm) },
              };
              break;
            case "less":
              condition = {
                [path[path.length - 1]]: { lt: Number(searchTerm) },
              };
              break;
            case "before":
              condition = {
                [path[path.length - 1]]: { lt: new Date(searchTerm) },
              };
              break;
            case "after":
              condition = {
                [path[path.length - 1]]: { gt: new Date(searchTerm) },
              };
              break;
            default:
              break;
          }

          let nestedCondition = condition;
          for (let i = path.length - 2; i >= 0; i--) {
            nestedCondition = { [path[i]]: nestedCondition };
          }

          conditions.push(nestedCondition);
        }
      );

      return conditions.length > 0 ? { AND: conditions } : {};
    };

    const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
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
            { model: { name: { contains: searchTerm } } },
            { model: { brand: { name: { contains: searchTerm } } } },
            { model: { type: { name: { contains: searchTerm } } } },
            { activeNumber: { contains: searchTerm } },
            { serialNumber: { contains: searchTerm } },
            { comments: { contains: searchTerm } },
          ],
        }
      : {};

    const deepSearchConditions = buildDeepSearchConditions(
      JSON?.parse(deepSearch)
    );

    const skip = (page - 1) * pageSize;
    const take = parseInt(pageSize);
    const whereConditions = {
      ...textSearchConditions,
      ...deepSearchConditions,
      enabled: true,
      ...(conditionName && {
        conditions: {
          some: {
            condition: {
              name: {
                in: Array.isArray(conditionName)
                  ? conditionName
                  : [conditionName],
              },
            },
          },
        },
      }),
    };

    const inventories = await db.inventory.findMany({
      where: whereConditions,
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
        images: {
          where: { enabled: true },
        },
        files: {
          where: { enabled: true },
        },
      },
      orderBy: formSortBy(orderField, orderDirection),
      skip,
      take,
    });

    const totalRecords = await db.inventory.count({
      where: whereConditions,
    });

    const totalPages = Math.ceil(totalRecords / pageSize);

    let inventoriesData = {};
    if (inventories) {
      inventoriesData = inventories.map((inventory) => {
        inventory.receptionDate
          ? (inventory.receptionDate = inventory.receptionDate
              .toISOString()
              .split("T")[0])
          : null;
        return inventory;
      });
    }
    res.json({
      data: inventoriesData,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
