import { db } from "../lib/db.js";

// Función para obtener los permisos del usuario

const generateInternalFolio = async (model) => {
  const normalize = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .trim()
      .substring(0, 3)
      .toUpperCase();

  const typeCode = normalize(model.type.name);
  const brandCode = normalize(model.brand.name);
  const modelCode = normalize(model.name);
  const baseCode = `${typeCode}-${brandCode}-${modelCode}`;

  const inventories = await db.inventory.findMany({
    where: {
      internalFolio: { startsWith: baseCode },
    },
    select: { internalFolio: true },
  });

  const usedNumbers = new Set();
  for (const inv of inventories) {
    const match = inv.internalFolio.match(new RegExp(`^${baseCode}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) {
        usedNumbers.add(num);
      }
    }
  }

  let next = 1;
  let finalFolio;

  while (true) {
    while (usedNumbers.has(next)) next++;
    finalFolio = `${baseCode}-${String(next).padStart(3, "0")}`;

    const exists = await db.inventory.findFirst({
      where: { internalFolio: finalFolio },
    });

    if (!exists) break;

    usedNumbers.add(next);
    next++;
  }

  return finalFolio;
};

const getUserPermissions = async (userId) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user) return [];
  return user.role.permissions.map((p) => p.permission.name);
};

export const getInventories = async (req, res) => {
  try {
    const userId = req.user.id; // Asegúrate de que req.user.id está disponible en el middleware de autenticación
    const permissions = await getUserPermissions(userId);
    const canViewAll = permissions.includes("view_inventories");
    const canViewSelf = permissions.includes("view_self_inventories");

    if (!canViewAll && !canViewSelf) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para ver los inventarios." });
    }

    const whereCondition = {
      enabled: true,
      ...(canViewAll ? {} : { createdById: userId }),
    };

    const inventories = await db.inventory.findMany({
      where: whereCondition,
      include: {
        model: { include: { brand: true, type: true } },
        conditions: { include: { condition: true } },
        customField: { include: { customField: true } },
        files: { where: { enabled: true } },
        images: {
          where: { enabled: true },
          select: { url: true, type: true, thumbnail: true, metadata: true },
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
    const userId = req.user.id;
    const permissions = await getUserPermissions(userId);
    const canViewAll = permissions.includes("view_inventories");
    const canViewSelf = permissions.includes("view_self_inventories");

    const inventory = await db.inventory.findUnique({
      where: { id, enabled: true },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        model: {
          include: {
            brand: true,
            type: true,
            ModelVertical: {
              include: { vertical: true },
            },
          },
        },
        conditions: {
          include: { condition: true },
        },
        customField: {
          include: { customField: true },
        },
        files: {
          where: { enabled: true },
          select: { id: true, url: true, type: true, metadata: true },
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
        invoice: {
          include: {
            purchaseOrder: {
              include: { project: true },
            },
          },
        },
        InventoryDeadline: {
          include: {
            deadline: {
              include: { project: true },
            },
          },
        },
      },
    });

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    if (!canViewAll && (!canViewSelf || inventory.createdById !== userId)) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para ver este inventario." });
    }

    // Formateo de fecha
    inventory.receptionDate =
      inventory.receptionDate?.toISOString().split("T")[0] || null;

    res.json(inventory);
  } catch (error) {
    console.log("Error fetching inventory:", error);
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

    // check if model exists
    const model = await db.model.findUnique({
      where: { id: parseInt(modelId, 10) },
      include: {
        brand: true,
        type: true,
      },
    });

    if (!model) {
      res.status(404).json({ message: "Modelo invalido" });
      return;
    }

    // check if the serial number is unique
    if (serialNumber && serialNumber.trim() !== "") {
      const existingInventory = await db.inventory.findFirst({
        where: { serialNumber, enabled: true },
      });

      if (existingInventory) {
        res.status(400).json({ message: "El número de serie ya existe" });
        return;
      }
    }

    const internalFolio = await generateInternalFolio(model);

    // check folio is generated
    if (!internalFolio) {
      res.status(500).json({ message: "Error al generar el folio interno" });
      return;
    }

    const createdInventory = await db.$transaction(async (prisma) => {
      const inventory = await prisma.inventory.create({
        data: {
          modelId: parseInt(modelId, 10),
          activeNumber,
          serialNumber,
          internalFolio,
          receptionDate: receptionDate ? new Date(receptionDate) : null,
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
        for (const { id: customFieldId, value } of customFields) {
          let customFieldIdInt = customFieldId;

          if (isNaN(customFieldIdInt)) {
            const newCustomField = await prisma.customField.create({
              data: { name: customFieldId },
            });
            customFieldIdInt = newCustomField.id;
          }

          await prisma.inventoryCustomField.create({
            data: {
              inventoryId: inventory.id,
              customFieldId: customFieldIdInt,
              value,
            },
          });
        }
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
    status,
  } = JSON.parse(req.body.inventory || "{}");

  try {
    const model = await db.model.findUnique({
      where: { id: parseInt(modelId, 10) },
    });

    if (!model) {
      res.status(404).json({ message: "Model not found" });
      return;
    }

    // check if the serial number is unique
    if (serialNumber && serialNumber.trim() !== "") {
      const existingInventory = await db.inventory.findFirst({
        where: { serialNumber, enabled: true, NOT: { id } },
      });

      if (existingInventory) {
        res.status(400).json({ message: "El número de serie ya existe" });
        return;
      }
    }

    await db.$transaction(async (prisma) => {
      await prisma.inventory.update({
        where: { id },
        data: {
          modelId: parseInt(modelId, 10),
          activeNumber,
          serialNumber,
          receptionDate: receptionDate ? new Date(receptionDate) : null,
          comments,
          details,
          status,
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
        const existingCustomFields = await prisma.inventoryCustomField.findMany(
          {
            where: { inventoryId: id },
          }
        );

        const existingCustomFieldsMap = new Map();
        existingCustomFields.forEach((field) => {
          existingCustomFieldsMap.set(field.customFieldId, field);
        });

        // Revisión de eliminación de campos que no están en customFields
        for (const [customFieldId, field] of existingCustomFieldsMap) {
          const exists = customFields.some(
            (field) => field.customFieldId === customFieldId
          );

          if (!exists) {
            await prisma.inventoryCustomField.delete({
              where: { id: field.id },
            });
          }
        }

        for (const customField of customFields) {
          let customFieldId = customField.customFieldId;

          if (customFieldId) {
            const existingCustomField =
              await prisma.inventoryCustomField.findUnique({
                where: {
                  inventoryId_customFieldId: { inventoryId: id, customFieldId },
                },
              });

            if (existingCustomField) {
              await prisma.inventoryCustomField.update({
                where: { id: existingCustomField.id },
                data: { value: customField.value },
              });
            } else {
              await prisma.inventoryCustomField.create({
                data: {
                  inventoryId: id,
                  customFieldId,
                  value: customField.value,
                },
              });
            }
          } else {
            const existingCustomField = await prisma.customField.findFirst({
              where: { id: customField.id },
            });

            if (existingCustomField) {
              await prisma.inventoryCustomField.create({
                data: {
                  inventoryId: id,
                  customFieldId: existingCustomField.id,
                  value: customField.value,
                },
              });
            } else {
              throw new Error("Campo personalizado no encontrado");
            }
          }
        }
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
    console.log("Error deleting inventory:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const checkSerialNumber = async (req, res) => {
  const { serialNumber, inventoryId } = req.body;
  const query = {
    serialNumber,
    enabled: true,
  };

  if (inventoryId) {
    query.id = { not: inventoryId };
  }

  const existingInventory = await db.inventory.findFirst({ where: query });

  if (existingInventory) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
};

export const searchInventories = async (req, res) => {
  try {
    const {
      searchTerm,
      sortBy = "updatedAt",
      order = "desc",
      page = 1,
      pageSize = 10,
      conditionName,
      status,
      advancedSearch = "false",
      deadlineId,
      projectId,
      purchaseOrderId,
      invoiceId,
      verticalId,
    } = req.query;
    // Validaciones de entrada mejoradas
    const isAdvanced = advancedSearch === "true";
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedPageSize =
      pageSize === "0" ? null : Math.max(1, parseInt(pageSize, 10) || 10);
    const searchTermTrimmed = searchTerm?.trim();

    // Términos individuales para búsqueda avanzada
    const individualTerms = searchTermTrimmed
      ? searchTermTrimmed.split(/\s+/).filter(Boolean)
      : [];

    // Conversión de IDs de verticales con validación
    const verticalIdsInt = verticalId
      ? (Array.isArray(verticalId) ? verticalId : [verticalId])
          .map((v) => parseInt(v, 10))
          .filter((n) => !isNaN(n) && n > 0)
      : [];

    // Función mejorada para validar fechas
    const isValidDate = (term) => {
      // Patrones específicos de fecha más estrictos
      const datePatterns = [
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/, // DD/MM/YYYY o DD-MM-YYYY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
        /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2})$/, // DD/MM/YY o DD-MM-YY
      ];

      // Verificar patrones específicos primero
      for (const pattern of datePatterns) {
        if (pattern.test(term)) {
          const match = term.match(pattern);
          if (match) {
            let day, month, year;

            if (pattern === datePatterns[0] || pattern === datePatterns[2]) {
              // DD/MM/YYYY o DD/MM/YY
              [, day, month, year] = match.map(Number);
              if (pattern === datePatterns[2] && year < 100) {
                year += year < 50 ? 2000 : 1900; // Asumir 20XX para años < 50, 19XX para >= 50
              }
            } else {
              // YYYY-MM-DD
              [, year, month, day] = match.map(Number);
            }

            // Validar rangos de fecha
            if (
              year >= 1900 &&
              year <= 2100 &&
              month >= 1 &&
              month <= 12 &&
              day >= 1 &&
              day <= 31
            ) {
              // Crear fecha y verificar que sea válida
              const date = new Date(year, month - 1, day);
              return (
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
              );
            }
          }
        }
      }

      return false;
    };

    // Función mejorada para parsear fechas
    const parseValidDate = (term) => {
      const datePatterns = [
        { regex: /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/, format: "DMY" },
        { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, format: "YMD" },
        { regex: /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2})$/, format: "DMY2" },
      ];

      for (const { regex, format } of datePatterns) {
        const match = term.match(regex);
        if (match) {
          let day, month, year;

          switch (format) {
            case "DMY":
            case "DMY2":
              [, day, month, year] = match.map(Number);
              if (format === "DMY2" && year < 100) {
                year += year < 50 ? 2000 : 1900;
              }
              break;
            case "YMD":
              [, year, month, day] = match.map(Number);
              break;
          }

          return new Date(year, month - 1, day);
        }
      }

      return null;
    };

    // Función para ordenamiento anidado optimizada
    const buildOrderBy = (sortBy, order) => {
      if (!sortBy.includes(".")) {
        return { [sortBy]: order };
      }

      const parts = sortBy.split(".");
      let orderObj = {};
      let current = orderObj;

      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = order;

      return orderObj;
    };

    // Condiciones base optimizadas
    const baseWhereConditions = {
      enabled: true,
      ...(status && {
        status: { in: Array.isArray(status) ? status : [status] },
      }),
      ...(conditionName &&
        !conditionName.includes("ALL") && {
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
      ...(deadlineId && {
        InventoryDeadline: { some: { deadlineId } },
      }),
      ...(projectId && {
        OR: [
          { InventoryDeadline: { some: { deadline: { projectId } } } },
          { invoice: { purchaseOrder: { projectId } } },
        ],
      }),
      ...(purchaseOrderId && {
        invoice: { purchaseOrderId },
      }),
      ...(invoiceId && { invoiceId }),
      ...(verticalIdsInt.length > 0 && {
        model: {
          ModelVertical: {
            some: {
              verticalId: { in: verticalIdsInt },
            },
          },
        },
      }),
    };

    // Función mejorada para condiciones de búsqueda
    const buildSearchConditions = (term) => {
      const textConditions = [
        // Campos de inventario
        { comments: { contains: term } },
        { activeNumber: { contains: term } },
        { serialNumber: { contains: term } },
        { internalFolio: { contains: term } },

        // Modelo, marca, tipo y vertical
        { model: { name: { contains: term } } },
        { model: { brand: { name: { contains: term } } } },
        { model: { type: { name: { contains: term } } } },
        {
          model: {
            ModelVertical: {
              some: {
                vertical: { name: { contains: term } },
              },
            },
          },
        },

        // Campos personalizados
        {
          customField: {
            some: {
              OR: [
                { value: { contains: term } },
                {
                  customField: {
                    name: { contains: term },
                  },
                },
              ],
            },
          },
        },

        // Facturas
        { invoice: { code: { contains: term } } },
        { invoice: { concept: { contains: term } } },

        // Órdenes de compra
        {
          invoice: {
            purchaseOrder: {
              code: { contains: term },
            },
          },
        },
        {
          invoice: {
            purchaseOrder: {
              supplier: { contains: term },
            },
          },
        },

        // Proyectos
        {
          invoice: {
            purchaseOrder: {
              project: {
                OR: [
                  { code: { contains: term } },
                  { name: { contains: term } },
                ],
              },
            },
          },
        },

        // Deadlines y proyectos desde deadline
        {
          InventoryDeadline: {
            some: {
              deadline: {
                OR: [
                  { name: { contains: term } },
                  {
                    project: { code: { contains: term } },
                  },
                  {
                    project: { name: { contains: term } },
                  },
                ],
              },
            },
          },
        },
      ];

      // Agregar condiciones de fecha solo si es una fecha válida
      if (isValidDate(term)) {
        const parsedDate = parseValidDate(term);
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          // Crear fechas en UTC para comparar correctamente con la base de datos
          const startOfDay = new Date(
            Date.UTC(
              parsedDate.getFullYear(),
              parsedDate.getMonth(),
              parsedDate.getDate(),
              0,
              0,
              0,
              0
            )
          );

          const endOfDay = new Date(
            Date.UTC(
              parsedDate.getFullYear(),
              parsedDate.getMonth(),
              parsedDate.getDate(),
              23,
              59,
              59,
              999
            )
          );

          // Verificar que las fechas estén en un rango razonable
          const minDate = new Date("1900-01-01");
          const maxDate = new Date("2100-12-31");

          if (startOfDay >= minDate && endOfDay <= maxDate) {
            textConditions.push(
              { receptionDate: { gte: startOfDay, lte: endOfDay } },
              { createdAt: { gte: startOfDay, lte: endOfDay } },
              { updatedAt: { gte: startOfDay, lte: endOfDay } },
              { altaDate: { gte: startOfDay, lte: endOfDay } },
              { bajaDate: { gte: startOfDay, lte: endOfDay } }
            );
          }
        }
      }

      return textConditions;
    };

    // Include optimizado
    const includeConfig = {
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      model: {
        include: {
          brand: true,
          type: true,
          ModelVertical: {
            include: { vertical: true },
          },
        },
      },
      invoice: {
        include: {
          purchaseOrder: {
            include: { project: true },
          },
        },
      },
      InventoryDeadline: {
        include: {
          deadline: {
            include: { project: true },
          },
        },
      },
      conditions: {
        include: { condition: true },
      },
      customField: {
        include: { customField: true },
      },
      files: {
        where: { enabled: true },
        select: { id: true, url: true, type: true, metadata: true },
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
    };

    // Ejecución de consultas optimizada
    let results, totalRecords;

    if (!searchTermTrimmed) {
      // Sin término de búsqueda - consulta directa
      const [countResult, dataResult] = await Promise.all([
        db.inventory.count({ where: baseWhereConditions }),
        db.inventory.findMany({
          where: baseWhereConditions,
          orderBy: buildOrderBy(sortBy, order),
          skip: parsedPageSize ? (parsedPage - 1) * parsedPageSize : undefined,
          take: parsedPageSize ?? undefined,
          include: includeConfig,
        }),
      ]);

      totalRecords = countResult;
      results = dataResult;
    } else {
      // Con término de búsqueda
      const searchConditions = isAdvanced
        ? individualTerms.flatMap(buildSearchConditions)
        : buildSearchConditions(searchTermTrimmed);

      const whereClause = {
        ...baseWhereConditions,
        OR: searchConditions,
      };

      const [countResult, dataResult] = await Promise.all([
        db.inventory.count({ where: whereClause }),
        db.inventory.findMany({
          where: whereClause,
          orderBy: buildOrderBy(sortBy, order),
          skip: parsedPageSize ? (parsedPage - 1) * parsedPageSize : undefined,
          take: parsedPageSize ?? undefined,
          include: includeConfig,
        }),
      ]);

      totalRecords = countResult;
      results = dataResult;
    }
    return res.json({
      data: results,
      pagination: {
        totalRecords,
        totalPages: parsedPageSize
          ? Math.ceil(totalRecords / parsedPageSize)
          : 1,
        currentPage: parsedPage,
        pageSize: parsedPageSize ?? "ALL",
      },
    });
  } catch (error) {
    console.error("Error en searchInventories:", error);
    return res.status(500).json({
      message: "Error al buscar inventarios",
      error: error.message,
    });
  }
};

export const assignMissingFolios = async (req, res) => {
  try {
    const inventories = await db.inventory.findMany({
      where: {
        enabled: true,
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

    const groupedByModel = {};
    for (const inventory of inventories) {
      const modelId = inventory.model.id;
      if (!groupedByModel[modelId]) groupedByModel[modelId] = [];
      groupedByModel[modelId].push(inventory);
    }

    const normalize = (str) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .trim()
        .substring(0, 3)
        .toUpperCase();

    for (const modelId in groupedByModel) {
      const modelInventories = groupedByModel[modelId];
      const model = modelInventories[0].model;

      const typeCode = normalize(model.type.name);
      const brandCode = normalize(model.brand.name);
      const modelCode = normalize(model.name);
      const baseCode = `${typeCode}-${brandCode}-${modelCode}`; // 👈 cambio aquí

      const existing = await db.inventory.findMany({
        where: {
          internalFolio: { startsWith: baseCode },
        },
        select: { internalFolio: true },
      });

      const usedNumbers = new Set();
      for (const inv of existing) {
        const match = inv.internalFolio.match(
          new RegExp(`^${baseCode}-(\\d+)$`)
        );
        if (match) {
          usedNumbers.add(parseInt(match[1], 10));
        }
      }

      let next = 1;
      for (const inventory of modelInventories) {
        let folio;
        while (true) {
          while (usedNumbers.has(next)) next++;
          folio = `${baseCode}-${String(next).padStart(3, "0")}`;
          const exists = await db.inventory.findFirst({
            where: { internalFolio: folio },
          });
          if (!exists) break;
          next++;
        }

        usedNumbers.add(next);

        await db.inventory.update({
          where: { id: inventory.id },
          data: { internalFolio: folio },
        });

        next++;
      }
    }

    res
      .status(200)
      .json({ message: "Folios regenerados con la nueva nomenclatura." });
  } catch (error) {
    console.log("Error regenerando folios:", error.message);
    res.status(500).json({ error: error.message });
  }
};
