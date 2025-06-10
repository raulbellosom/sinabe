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
  const baseCode = `INV-${typeCode}-${brandCode}`;

  // Busca TODOS los folios existentes para este modelo (sin filtrar por enabled)
  const inventories = await db.inventory.findMany({
    where: {
      modelId: model.id,
      internalFolio: { startsWith: baseCode },
    },
    select: { internalFolio: true },
  });

  // Extrae el número más alto
  let max = 0;
  const usedNumbers = new Set();
  for (const inv of inventories) {
    const match = inv.internalFolio.match(new RegExp(`^${baseCode}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      usedNumbers.add(num);
      if (num > max) max = num;
    }
  }

  // Busca el siguiente número libre
  let next = 1;
  while (usedNumbers.has(next)) next++;
  const consecutive = String(next).padStart(3, "0");
  return `${baseCode}-${consecutive}`;
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
        model: { include: { brand: true, type: true } },
        conditions: { include: { condition: true } },
        customField: { include: { customField: true } },
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

    inventory.receptionDate =
      inventory.receptionDate?.toISOString().split("T")[0] || null;
    res.json(inventory);
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
    console.log(error.message);
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

// export const searchInventories = async (req, res) => {
//   try {
//     const userId = req.user?.id; // Asegurarse de que el usuario esté autenticado
//     if (!userId) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }
//     const permissions = await getUserPermissions(userId);
//     // const permissions = user.role.permissions.map((p) => p.permission.name);
//     const canViewAll = permissions.includes("view_inventories");
//     const canViewSelf = permissions.includes("view_self_inventories");
//     // Si el usuario no tiene ninguno de los permisos necesarios, se le niega el acceso.
//     if (!canViewAll && !canViewSelf) {
//       return res.status(403).json({
//         error: "Forbidden: No tienes permisos para acceder a los inventarios",
//       });
//     }

//     const {
//       searchTerm,
//       sortBy = "updatedAt",
//       order = "desc",
//       page = 1,
//       pageSize = 10,
//       conditionName,
//       deepSearch = [],
//       status,
//     } = req.query;

//     const validSortFields = [
//       "createdAt",
//       "status",
//       "model.name",
//       "model.brand.name",
//       "model.type.name",
//       "activeNumber",
//       "serialNumber",
//       "updatedAt",
//       "receptionDate",
//       "comments",
//     ];

//     const mapSearchHeaderToColumn = (searchHeader, customFieldName) => {
//       const columnsMap = {
//         "model.name": "model.name",
//         "model.type.name": "model.type.name",
//         "model.brand.name": "model.brand.name",
//         activeNumber: "activeNumber",
//         serialNumber: "serialNumber",
//         comments: "comments",
//         customField: `customField.${customFieldName}`,
//       };
//       return columnsMap[searchHeader] || null;
//     };

//     const buildDeepSearchConditions = (deepSearchArray) => {
//       const conditions = [];

//       deepSearchArray.forEach(
//         ({ searchHeader, searchTerm, searchCriteria, customFieldName }) => {
//           const column = mapSearchHeaderToColumn(searchHeader, customFieldName);

//           if (!column || typeof column !== "string") return;

//           if (searchHeader === "customField" && customFieldName) {
//             // Crear condiciones específicas para customFields
//             const condition = {
//               customField: {
//                 some: {
//                   customField: {
//                     name: customFieldName, // Nombre del campo personalizado
//                   },
//                   value: { [searchCriteria]: searchTerm }, // Valor buscado
//                 },
//               },
//             };
//             conditions.push(condition);
//           } else {
//             const path = column.split(".");
//             let condition = {};

//             switch (searchCriteria) {
//               case "equals":
//                 condition = { [path[path.length - 1]]: { equals: searchTerm } };
//                 break;
//               case "startsWith":
//                 condition = {
//                   [path[path.length - 1]]: { startsWith: searchTerm },
//                 };
//                 break;
//               case "endsWith":
//                 condition = {
//                   [path[path.length - 1]]: { endsWith: searchTerm },
//                 };
//                 break;
//               case "contains":
//                 condition = {
//                   [path[path.length - 1]]: { contains: searchTerm },
//                 };
//                 break;
//               case "different":
//                 condition = { [path[path.length - 1]]: { not: searchTerm } };
//                 break;
//               case "contains":
//                 condition = {
//                   [path[path.length - 1]]: { contains: searchTerm },
//                 };
//                 break;
//               default:
//                 break;
//             }

//             let nestedCondition = condition;
//             for (let i = path.length - 2; i >= 0; i--) {
//               nestedCondition = { [path[i]]: nestedCondition };
//             }

//             conditions.push(nestedCondition);
//           }
//         }
//       );

//       return conditions.length > 0 ? { AND: conditions } : {};
//     };

//     // Ampliamos la búsqueda por texto para incluir archivos y customFields
//     // const textSearchConditions = searchTerm
//     //   ? {
//     //       OR: [
//     //         { model: { name: { contains: searchTerm } } },
//     //         { model: { brand: { name: { contains: searchTerm } } } },
//     //         { model: { type: { name: { contains: searchTerm } } } },
//     //         { activeNumber: { contains: searchTerm } },
//     //         { serialNumber: { contains: searchTerm } },
//     //         { comments: { contains: searchTerm } },
//     //         {
//     //           customField: {
//     //             some: {
//     //               OR: [
//     //                 { value: { contains: searchTerm } },
//     //                 { customField: { name: { contains: searchTerm } } },
//     //               ],
//     //             },
//     //           },
//     //         },
//     //       ],
//     //     }
//     //   : {};
//     const terms = searchTerm?.split(/\s+/).filter(Boolean) || [];
//     const generateSearchConditions = (terms) => {
//       const fields = [
//         { model: { name: true } },
//         { model: { brand: { name: true } } },
//         { model: { type: { name: true } } },
//         { activeNumber: true },
//         { serialNumber: true },
//         { comments: true },
//         {
//           customField: {
//             some: {
//               OR: [{ value: true }, { customField: { name: true } }],
//             },
//           },
//         },
//       ];

//       const conditions = [];

//       for (const term of terms) {
//         for (const field of fields) {
//           const condition = JSON.parse(JSON.stringify(field));
//           applyContainsCondition(condition, term);
//           conditions.push(condition);
//         }
//       }

//       return { OR: conditions };
//     };

//     const applyContainsCondition = (obj, term) => {
//       for (const key in obj) {
//         if (typeof obj[key] === "object") {
//           applyContainsCondition(obj[key], term);
//         } else if (obj[key] === true) {
//           obj[key] = { contains: term };
//         }
//       }
//     };

//     const textSearchConditions = searchTerm
//       ? generateSearchConditions(terms)
//       : {};

//     const deepSearchConditions = buildDeepSearchConditions(
//       JSON?.parse(deepSearch)
//     );

//     const orderField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
//     const orderDirection = order === "desc" ? "desc" : "asc";

//     const formSortBy = (value, order) => {
//       let arr = value.split(".");
//       let obj = {};
//       if (arr.length === 3) {
//         obj = {
//           [arr[0]]: {
//             [arr[1]]: {
//               [arr[2]]: order,
//             },
//           },
//         };
//       } else if (arr.length === 2) {
//         obj = {
//           [arr[0]]: {
//             [arr[1]]: order,
//           },
//         };
//       } else {
//         obj = {
//           [arr[0]]: order,
//         };
//       }
//       return obj;
//     };

//     const skip = (page - 1) * pageSize;
//     const take = parseInt(pageSize);

//     const statusFilter = Array.isArray(status)
//       ? status
//       : status
//       ? [status]
//       : [];

//     const whereConditions = {
//       ...textSearchConditions,
//       ...deepSearchConditions,
//       enabled: true,
//       ...(conditionName && conditionName.includes("ALL")
//         ? {} // Si viene ALL, no filtramos por condiciones
//         : conditionName && {
//             conditions: {
//               some: {
//                 condition: {
//                   name: {
//                     in: Array.isArray(conditionName)
//                       ? conditionName
//                       : [conditionName],
//                   },
//                 },
//               },
//             },
//           }),

//       ...(statusFilter.length > 0 ? { status: { in: statusFilter } } : {}),
//     };

//     if (!canViewAll && canViewSelf) {
//       whereConditions.createdById = userId;
//     }

//     const inventories = await db.inventory.findMany({
//       where: whereConditions,
//       include: {
//         model: {
//           include: {
//             brand: true,
//             type: true,
//           },
//         },
//         conditions: {
//           include: {
//             condition: true,
//           },
//         },
//         images: {
//           where: { enabled: true },
//         },
//         files: {
//           where: { enabled: true },
//         },
//         customField: {
//           include: {
//             customField: true,
//           },
//         },
//         createdBy: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//           },
//         },
//       },
//       orderBy: formSortBy(orderField, orderDirection),
//       skip,
//       take: take === 0 ? undefined : take, // If take is 0, fetch all inventories
//     });

//     const totalRecords = await db.inventory.count({
//       where: whereConditions,
//     });

//     const totalPages = Math.ceil(totalRecords / pageSize);
//     res.json({
//       data: inventories,
//       pagination: {
//         totalRecords,
//         totalPages,
//         currentPage: parseInt(page),
//         pageSize: parseInt(pageSize),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching inventories:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const searchInventories = async (req, res) => {
  try {
    const {
      searchTerm,
      sortBy = "updatedAt",
      order = "desc",
      page = 1,
      pageSize = 10,
      conditionName,
      deepSearch = "[]",
      status,
      advancedSearch = "true",
    } = req.query;

    console.log(advancedSearch);

    const parsedDeepSearch = JSON.parse(deepSearch);
    const isAdvanced = advancedSearch === "true";

    const buildOrderBy = (sortBy, order) => {
      const parts = sortBy.split(".");
      let current = {};
      let nested = current;

      for (let i = 0; i < parts.length - 1; i++) {
        nested[parts[i]] = {};
        nested = nested[parts[i]];
      }

      nested[parts[parts.length - 1]] = order;
      return current;
    };

    const whereConditions = {
      enabled: true,
      ...(status && {
        status: {
          in: Array.isArray(status) ? status : [status],
        },
      }),
      ...(conditionName && conditionName.includes("ALL")
        ? {} // No filtrar por condición si es ALL
        : conditionName && {
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

    const phraseSearch = searchTerm?.trim();
    const individualTerms = phraseSearch
      ? phraseSearch.split(/\s+/).filter(Boolean)
      : [];

    const buildSearchConditions = (term) => [
      { comments: { contains: term } },
      { model: { name: { contains: term } } },
      { model: { brand: { name: { contains: term } } } },
      { model: { type: { name: { contains: term } } } },
      { activeNumber: { contains: term } },
      { serialNumber: { contains: term } },
      {
        customField: {
          some: {
            OR: [
              { value: { contains: term } },
              { customField: { name: { contains: term } } },
            ],
          },
        },
      },
    ];

    const include = {
      createdBy: true,
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
      files: true,
      images: true,
    };

    let combined = [];

    if (!phraseSearch) {
      const totalRecords = await db.inventory.count({ where: whereConditions });
      const results = await db.inventory.findMany({
        where: whereConditions,
        orderBy: buildOrderBy(sortBy, order),
        skip: (page - 1) * pageSize,
        take: parseInt(pageSize),
        include,
      });

      return res.json({
        data: results,
        pagination: {
          totalRecords,
          totalPages: Math.ceil(totalRecords / pageSize),
          currentPage: parseInt(page),
          pageSize: parseInt(pageSize),
        },
      });
    }

    if (!isAdvanced) {
      const results = await db.inventory.findMany({
        where: {
          ...whereConditions,
          OR: buildSearchConditions(phraseSearch),
        },
        orderBy: buildOrderBy(sortBy, order),
        skip: (page - 1) * pageSize,
        take: parseInt(pageSize),
        include,
      });

      const totalRecords = await db.inventory.count({
        where: {
          ...whereConditions,
          OR: buildSearchConditions(phraseSearch),
        },
      });

      return res.json({
        data: results,
        pagination: {
          totalRecords,
          totalPages: Math.ceil(totalRecords / pageSize),
          currentPage: parseInt(page),
          pageSize: parseInt(pageSize),
        },
      });
    }

    const exactMatchWhere = {
      ...whereConditions,
      OR: buildSearchConditions(phraseSearch),
    };

    const wordMatchWhere = {
      ...whereConditions,
      OR: individualTerms.flatMap((term) => buildSearchConditions(term)),
    };

    const exactResults = await db.inventory.findMany({
      where: exactMatchWhere,
      include,
    });

    const wordResults = await db.inventory.findMany({
      where: wordMatchWhere,
      include,
    });

    combined = [
      ...exactResults,
      ...wordResults.filter(
        (item) => !exactResults.some((ex) => ex.id === item.id)
      ),
    ];

    const start = (page - 1) * pageSize;
    const paginatedResults = combined.slice(start, start + parseInt(pageSize));

    res.json({
      data: paginatedResults,
      pagination: {
        totalRecords: combined.length,
        totalPages: Math.ceil(combined.length / pageSize),
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al buscar inventarios" });
  }
};

export const assignMissingFolios = async (req, res) => {
  try {
    const inventories = await db.inventory.findMany({
      where: {
        internalFolio: null,
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

    // Agrupa inventarios por modelo
    const groupedByModel = {};
    for (const inventory of inventories) {
      const modelId = inventory.model.id;
      if (!groupedByModel[modelId]) groupedByModel[modelId] = [];
      groupedByModel[modelId].push(inventory);
    }

    const normalize = (str) => str.trim().substring(0, 3).toUpperCase();

    for (const modelId in groupedByModel) {
      const modelInventories = groupedByModel[modelId];
      const model = modelInventories[0].model;

      const typeCode = normalize(model.type.name);
      const brandCode = normalize(model.brand.name);
      const baseCode = `INV-${typeCode}-${brandCode}`;

      // Busca todos los folios existentes para este modelo (sin filtrar por enabled)
      const existing = await db.inventory.findMany({
        where: {
          modelId: model.id,
          internalFolio: {
            startsWith: baseCode,
          },
        },
        select: { internalFolio: true },
      });

      // Extrae todos los números usados
      const usedNumbers = new Set();
      for (const inv of existing) {
        const match = inv.internalFolio.match(
          new RegExp(`^${baseCode}-(\\d+)$`)
        );
        if (match) {
          usedNumbers.add(parseInt(match[1], 10));
        }
      }

      // Asigna folios secuenciales saltando los ya usados y verificando existencia
      let next = 1;
      for (const inventory of modelInventories) {
        let folio;
        while (true) {
          while (usedNumbers.has(next)) next++;
          folio = `${baseCode}-${String(next).padStart(3, "0")}`;
          // Verifica en la base de datos por si acaso
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

    res.status(200).json({ message: "Folios generados correctamente." });
  } catch (error) {
    console.log("Error generating internal folios:", error.message);
    res.status(500).json({ error: error.message });
  }
};
