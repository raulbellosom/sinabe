import { db } from "../lib/db.js";
import { generateCustodyPDF } from "../services/pdfService.js";
import { sendCustodyEmail } from "../services/emailService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Helper to finalize a custody record (Generate PDF, Save, Email)
 */
async function finalizeCustodyRecord(recordId) {
  const record = await db.custodyRecord.findUnique({
    where: { id: recordId },
    include: {
      receiver: true,
      deliverer: true,
      items: true,
    },
  });

  if (!record) throw new Error("Record not found for finalization");

  // Format Date
  const dateObj = new Date(record.date);
  const formattedDate = `${dateObj.getDate().toString().padStart(2, "0")}/${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${dateObj.getFullYear()}`;

  const pdfData = {
    date: formattedDate,
    receiver: {
      name: `${record.receiver.firstName} ${record.receiver.lastName}`,
      employeeNumber: record.receiver.employeeNumber || "",
      jobTitle: record.receiver.jobTitle || "",
      department: record.receiver.department || "",
    },
    delivererName: record.deliverer
      ? `${record.deliverer.firstName} ${record.deliverer.lastName}`
      : "",
    items: record.items,
    comments: record.comments,
    signatures: {
      receiver: record.receiverSignature,
      deliverer: record.delivererSignature,
    },
  };

  const pdfBytes = await generateCustodyPDF(pdfData);

  // Save PDF
  const uploadsDir = path.join(__dirname, "../uploads/resguardos");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const receiverName = `${record.receiver.firstName} ${record.receiver.lastName}`;
  const safeReceiverName = receiverName.replace(/[<>:"/\\|?*]/g, "");
  const safeDate = formattedDate.replace(/\//g, "-");
  const fileName = `Resguardo TI - ${safeReceiverName} - ${safeDate}.pdf`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, pdfBytes);

  // File Link
  const fileRecord = await db.file.create({
    data: {
      url: `/uploads/resguardos/${fileName}`,
      type: "application/pdf",
      custodyRecords: { connect: { id: record.id } },
    },
  });

  // Update items' file records
  if (record.items && record.items.length > 0) {
    await Promise.all(
      record.items.map((item) =>
        db.file.create({
          data: {
            url: `/uploads/resguardos/${fileName}`,
            type: "application/pdf",
            inventoryId: item.inventoryId,
          },
        })
      )
    );
  }

  // Public Token
  const publicToken = uuidv4();
  const tokenExpiresAt = new Date();
  tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

  const updatedRecord = await db.custodyRecord.update({
    where: { id: record.id },
    data: {
      status: "COMPLETADO",
      fileId: fileRecord.id,
      publicToken,
      tokenExpiresAt,
    },
    include: {
      receiver: true,
      deliverer: true,
      file: true,
      items: {
        include: {
          inventory: {
            include: {
              model: {
                include: {
                  type: true,
                  brand: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Email
  if (updatedRecord.receiver.email) {
    try {
      await sendCustodyEmail(
        updatedRecord.receiver.email,
        "Resguardo de Equipo Tecnológico",
        `Hola ${updatedRecord.receiver.firstName}, se ha completado tu resguardo de equipo.`,
        [{ filename: fileName, content: pdfBytes }]
      );
    } catch (emailErr) {
      console.error("Failed to send email on finalization:", emailErr);
    }
  }

  return updatedRecord;
}

export const createCustodyRecord = async (req, res) => {
  try {
    const {
      date,
      receiver, // { userId, isNewInactiveUser, employeeNumber, name, email, jobTitle, department }
      delivererUserId,
      comments,
      items, // [{ inventoryId, typeBrand, model, serialNumber, assetNumber, features }]
      signatures, // { receiver: base64, deliverer: base64 }
      status = "BORRADOR",
    } = req.body;

    // 1. Resolve Receiver
    let receiverId = receiver.userId;
    let receiverUser = null;

    if (receiver.isNewInactiveUser) {
      // Create new inactive user
      // Check if email or username exists
      const existingUser = await db.user.findFirst({
        where: {
          OR: [
            { email: receiver.email },
            { userName: receiver.userName || receiver.email },
          ],
        },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "El usuario ya existe (email/username)." });
      }

      // We need a password for the user model, even if inactive. Generate random.
      const randomPassword = uuidv4();

      // Find or create "Resguardos" role
      let role = await db.role.findFirst({ where: { name: "Resguardos" } });
      if (!role) {
        // Create permission-less role
        role = await db.role.create({ data: { name: "Resguardos" } });
      }

      receiverUser = await db.user.create({
        data: {
          firstName: receiver.firstName,
          lastName: receiver.lastName,
          email: receiver.email,
          userName: receiver.userName || receiver.email,
          password: randomPassword, // Should be hashed but for inactive user maybe ok or hash it if using bcrypt
          roleId: role.id,
          enabled: false, // Inactive
          employeeNumber: receiver.employeeNumber,
          jobTitle: receiver.jobTitle,
          department: receiver.department,
        },
      });
      receiverId = receiverUser.id;
    } else {
      receiverUser = await db.user.findUnique({ where: { id: receiverId } });
      if (!receiverUser) {
        return res
          .status(404)
          .json({ message: "Usuario receptor no encontrado." });
      }
      // Update user details if provided? Maybe not.
    }

    // 2. Validate Inventories
    // Check if they exist.
    // Also fetch details if not fully provided in items array, but items array has overrides.
    // The items array from frontend should have the data for the PDF.

    // 3. Create Custody Record in DB
    const custodyRecord = await db.$transaction(async (prisma) => {
      // Create Record
      const record = await prisma.custodyRecord.create({
        data: {
          date: new Date(date),
          receiverId,
          delivererId: delivererUserId,
          comments,
          status,
          receiverSignature: signatures?.receiver || null,
          delivererSignature: signatures?.deliverer || null,
          items: {
            create: items.map((item) => ({
              inventoryId: item.inventoryId,
              typeBrand: item.typeBrand,
              model: item.model,
              serialNumber: item.serialNumber,
              assetNumber: item.assetNumber,
              invoiceNumber: item.invoiceNumber,
              features: item.features,
            })),
          },
        },
        include: {
          receiver: true,
          deliverer: true,
          items: {
            include: {
              inventory: {
                include: {
                  model: {
                    include: {
                      type: true,
                      brand: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return record;
    });

    // 3.5 If draft, return early
    if (status === "BORRADOR") {
      return res.status(201).json({
        message: "Borrador guardado exitosamente",
        custodyRecord,
      });
    }

    // 4. Generate PDF
    if (status === "COMPLETADO") {
      const finalRecord = await finalizeCustodyRecord(custodyRecord.id);

      if (finalRecord.receiver) delete finalRecord.receiver.password;
      if (finalRecord.deliverer) delete finalRecord.deliverer.password;

      return res.status(201).json({
        message: "Resguardo creado y completado exitosamente",
        custodyRecord: {
          ...finalRecord,
          fileUrl: finalRecord.file?.url,
          publicLink: `${process.env.FRONTEND_URL || ""}/custody/public/${
            finalRecord.publicToken
          }`,
        },
      });
    }

    const publicToken = uuidv4();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);

    const draftRecord = await db.custodyRecord.update({
      where: { id: custodyRecord.id },
      data: { publicToken, tokenExpiresAt },
      include: { receiver: true, deliverer: true },
    });

    if (draftRecord.receiver) delete draftRecord.receiver.password;
    if (draftRecord.deliverer) delete draftRecord.deliverer.password;

    res.status(201).json({
      message: "Resguardo creado exitosamente",
      custodyRecord: {
        ...draftRecord,
        publicLink: `${process.env.FRONTEND_URL || ""}/custody/public/${
          draftRecord.publicToken
        }`,
      },
    });
  } catch (error) {
    console.error("Error creating custody record:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const getCustodyRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await db.custodyRecord.findUnique({
      where: { id },
      include: {
        receiver: true,
        deliverer: true,
        items: {
          include: {
            inventory: {
              include: {
                model: {
                  include: {
                    type: true,
                    brand: true,
                  },
                },
              },
            },
          },
        },
        file: true,
      },
    });

    if (!record) {
      return res.status(404).json({ message: "Resguardo no encontrado" });
    }

    if (record.receiver) delete record.receiver.password;
    if (record.deliverer) delete record.deliverer.password;

    res.json(record);
  } catch (error) {
    console.error("Error fetching custody record:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getCustodyRecords = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      searchTerm = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const where = {
      enabled: true,
    };

    if (searchTerm) {
      where.OR = [
        {
          receiver: {
            OR: [
              { firstName: { contains: searchTerm } }, // Case insensitive handled by DB usually or need mode: 'insensitive'
              { lastName: { contains: searchTerm } },
              { employeeNumber: { contains: searchTerm } },
            ],
          },
        },
        {
          items: {
            some: {
              OR: [
                { typeBrand: { contains: searchTerm } },
                { model: { contains: searchTerm } },
                { serialNumber: { contains: searchTerm } },
                { assetNumber: { contains: searchTerm } },
                { invoiceNumber: { contains: searchTerm } },
              ],
            },
          },
        },
      ];
    }

    let orderBy = {};
    if (sortBy === "receiver") {
      orderBy = { receiver: { firstName: sortOrder } };
    } else if (sortBy === "deliverer") {
      orderBy = { deliverer: { firstName: sortOrder } };
    } else if (sortBy === "employeeNumber") {
      orderBy = { receiver: { employeeNumber: sortOrder } };
    } else if (sortBy === "items") {
      // Sorting by relation count is complex in Prisma, defaulting to createdAt
      orderBy = { createdAt: sortOrder };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const [records, totalRecords] = await Promise.all([
      db.custodyRecord.findMany({
        where,
        include: {
          receiver: true,
          deliverer: true,
          file: true,
          items: {
            include: {
              inventory: {
                include: {
                  model: {
                    include: {
                      type: true,
                      brand: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      db.custodyRecord.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / take);

    records.forEach((record) => {
      if (record.receiver) delete record.receiver.password;
      if (record.deliverer) delete record.deliverer.password;
    });

    res.json({
      data: records,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords,
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching custody records:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteCustodyRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find record
    const record = await db.custodyRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return res.status(404).json({ message: "Resguardo no encontrado" });
    }

    // 2. Soft Delete (Logical Delete)
    await db.custodyRecord.update({
      where: { id },
      data: { enabled: false },
    });

    res.json({ message: "Resguardo eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting custody record:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getCustodyRecordByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const record = await db.custodyRecord.findUnique({
      where: { publicToken: token },
      include: {
        receiver: true,
        deliverer: true,
        items: {
          include: {
            inventory: {
              include: {
                model: {
                  include: {
                    type: true,
                    brand: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!record) {
      return res.status(404).json({ message: "Enlace no válido o expirado." });
    }

    // Check expiration
    if (record.tokenExpiresAt && new Date() > record.tokenExpiresAt) {
      return res.status(410).json({ message: "El enlace ha expirado." });
    }

    // Security: Only include necessary public info
    const publicData = {
      id: record.id,
      date: record.date,
      status: record.status,
      receiver: {
        firstName: record.receiver.firstName,
        lastName: record.receiver.lastName,
        employeeNumber: record.receiver.employeeNumber,
        jobTitle: record.receiver.jobTitle,
        department: record.receiver.department,
      },
      deliverer: record.deliverer
        ? {
            firstName: record.deliverer.firstName,
            lastName: record.deliverer.lastName,
          }
        : null,
      items: record.items,
      comments: record.comments,
      receiverSignature: record.receiverSignature,
      delivererSignature: record.delivererSignature,
      createdAt: record.createdAt,
    };

    res.json(publicData);
  } catch (error) {
    console.error("Error fetching public custody record:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateCustodyRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      receiver,
      comments,
      items,
      signatures,
      status, // New status requested
    } = req.body;

    // 1. Fetch current record
    const currentRecord = await db.custodyRecord.findUnique({
      where: { id },
      include: { receiver: true },
    });

    if (!currentRecord) {
      return res.status(404).json({ message: "Resguardo no encontrado." });
    }

    // 2. Enforce Immutability: Only BORRADOR can be edited
    if (currentRecord.status === "COMPLETADO") {
      return res.status(403).json({
        message: "No se puede editar un resguardo que ya ha sido completado.",
      });
    }

    // 3. Update DB Record
    const updatedRecord = await db.$transaction(async (prisma) => {
      // Clear old items
      await prisma.custodyItem.deleteMany({ where: { custodyRecordId: id } });

      // Update basic fields
      const record = await prisma.custodyRecord.update({
        where: { id },
        data: {
          date: new Date(date),
          comments,
          status,
          receiverSignature:
            signatures?.receiver || currentRecord.receiverSignature,
          delivererSignature:
            signatures?.deliverer || currentRecord.delivererSignature,
          items: {
            create: items.map((item) => ({
              inventoryId: item.inventoryId,
              typeBrand: item.typeBrand,
              model: item.model,
              serialNumber: item.serialNumber,
              assetNumber: item.assetNumber,
              invoiceNumber: item.invoiceNumber,
              features: item.features,
            })),
          },
        },
        include: {
          receiver: true,
          deliverer: true,
          items: {
            include: {
              inventory: {
                include: {
                  model: {
                    include: {
                      type: true,
                      brand: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return record;
    });

    // 4. If finalized now, generate PDF and Email
    if (status === "COMPLETADO" && currentRecord.status === "BORRADOR") {
      const finalRecord = await finalizeCustodyRecord(updatedRecord.id);

      if (finalRecord.receiver) delete finalRecord.receiver.password;
      if (finalRecord.deliverer) delete finalRecord.deliverer.password;

      return res.json({
        message: "Resguardo completado y procesado exitosamente",
        custodyRecord: {
          ...finalRecord,
          fileUrl: finalRecord.file?.url,
          publicLink: `${process.env.FRONTEND_URL || ""}/custody/public/${
            finalRecord.publicToken
          }`,
        },
      });
    }

    res.json({
      message: "Resguardo actualizado exitosamente",
      custodyRecord: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating custody record:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const resendCustodyEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await db.custodyRecord.findUnique({
      where: { id },
      include: {
        receiver: true,
        file: true,
      },
    });

    if (!record || record.status !== "COMPLETADO") {
      return res.status(400).json({
        message:
          "No se puede enviar correo de un resguardo no completado o inexistente.",
      });
    }

    if (!record.receiver.email) {
      return res.status(400).json({
        message: "El receptor no tiene un correo electrónico configurado.",
      });
    }

    if (!record.file?.url) {
      return res
        .status(400)
        .json({ message: "No se encontró el archivo PDF adjunto." });
    }

    const filePath = path.join(__dirname, "..", record.file.url);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "El archivo PDF no existe en el servidor." });
    }

    const pdfContent = fs.readFileSync(filePath);

    await sendCustodyEmail(
      record.receiver.email,
      "Reenvío: Resguardo de Equipo Tecnológico",
      `Hola ${record.receiver.firstName}, te reenviamos tu resguardo de equipo solicitado.`,
      [{ filename: path.basename(filePath), content: pdfContent }]
    );

    res.json({ message: "Correo reenviado exitosamente." });
  } catch (error) {
    console.error("Error resending email:", error);
    res
      .status(500)
      .json({ message: "Error al reenviar correo", error: error.message });
  }
};

export const getPublicLink = async (req, res) => {
  try {
    const { id } = req.params;

    let record = await db.custodyRecord.findUnique({
      where: { id },
      select: { publicToken: true, tokenExpiresAt: true, status: true },
    });

    if (!record) {
      return res.status(404).json({ message: "Resguardo no encontrado." });
    }

    // If token is missing or expired, generate a new one
    let token = record.publicToken;
    let expires = record.tokenExpiresAt;

    if (!token || !expires || new Date() > expires) {
      token = uuidv4();
      expires = new Date();
      expires.setHours(expires.getHours() + 24);

      await db.custodyRecord.update({
        where: { id },
        data: {
          publicToken: token,
          tokenExpiresAt: expires,
        },
      });
    }

    res.json({
      publicToken: token,
      publicLink: `${process.env.FRONTEND_URL || ""}/custody/public/${token}`,
      expiresAt: expires,
      status: record.status,
    });
  } catch (error) {
    console.error("Error retrieving public link:", error);
    res.status(500).json({ message: "Error al obtener enlace público" });
  }
};

export const submitPublicSignature = async (req, res) => {
  try {
    const { token } = req.params;
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ message: "La firma es obligatoria." });
    }

    const record = await db.custodyRecord.findUnique({
      where: { publicToken: token },
    });

    if (
      !record ||
      (record.tokenExpiresAt && new Date() > record.tokenExpiresAt)
    ) {
      return res.status(404).json({ message: "Enlace no válido o expirado." });
    }

    if (record.status !== "BORRADOR") {
      return res
        .status(400)
        .json({ message: "Este resguardo ya ha sido finalizado." });
    }

    // Update signature
    await db.custodyRecord.update({
      where: { id: record.id },
      data: { receiverSignature: signature },
    });

    // Finalize
    const finalized = await finalizeCustodyRecord(record.id);

    if (finalized.receiver) delete finalized.receiver.password;
    if (finalized.deliverer) delete finalized.deliverer.password;

    res.json({
      message: "Firma registrada y resguardo finalizado exitosamente.",
      custodyRecord: {
        ...finalized,
        fileUrl: finalized.file?.url,
        publicLink: `${process.env.FRONTEND_URL || ""}/custody/public/${
          finalized.publicToken
        }`,
      },
    });
  } catch (error) {
    console.error("Error submitting public signature:", error);
    res.status(500).json({ message: "Error al registrar la firma." });
  }
};
