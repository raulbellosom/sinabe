import { db } from "../lib/db.js";
import { generateCustodyPDF } from "../services/pdfService.js";
import { sendCustodyEmail } from "../services/emailService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createCustodyRecord = async (req, res) => {
  try {
    const {
      date,
      receiver, // { userId, isNewInactiveUser, employeeNumber, name, email, jobTitle, department }
      delivererUserId,
      comments,
      items, // [{ inventoryId, typeBrand, model, serialNumber, assetNumber, features }]
      signatures, // { receiver: base64, deliverer: base64 }
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
          items: true,
        },
      });

      return record;
    });

    // 4. Generate PDF
    // Prepare data for PDF
    const [year, month, day] = date.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    const pdfData = {
      date: formattedDate, // Format date
      receiver: {
        name: `${receiverUser.firstName} ${receiverUser.lastName}`,
        employeeNumber: receiverUser.employeeNumber || "",
        jobTitle: receiverUser.jobTitle || "",
        department: receiverUser.department || "",
      },
      delivererName: custodyRecord.deliverer
        ? `${custodyRecord.deliverer.firstName} ${custodyRecord.deliverer.lastName}`
        : "",
      items: items,
      comments,
      signatures,
    };

    const pdfBytes = await generateCustodyPDF(pdfData);

    // 5. Save PDF
    const uploadsDir = path.join(__dirname, "../uploads/resguardos");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Construct filename: Resguardo TI - Name - Date.pdf
    const receiverName = `${receiverUser.firstName} ${receiverUser.lastName}`;
    // Sanitize name to remove characters invalid in filenames
    const safeReceiverName = receiverName.replace(/[<>:"/\\|?*]/g, "");
    const safeDate = formattedDate.replace(/\//g, "-");

    const fileName = `Resguardo TI - ${safeReceiverName} - ${safeDate}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, pdfBytes);

    // 6. Create File Record and Link
    // Create the main file record for the CustodyRecord
    const fileRecord = await db.file.create({
      data: {
        url: `/uploads/resguardos/${fileName}`,
        type: "application/pdf",
        inventoryId: null,
        custodyRecords: {
          connect: { id: custodyRecord.id },
        },
      },
    });

    // Update CustodyRecord with fileId
    await db.custodyRecord.update({
      where: { id: custodyRecord.id },
      data: { fileId: fileRecord.id },
    });

    // Create File records for each inventory involved so it appears in their files list
    // We use the same URL
    if (items && items.length > 0) {
      await Promise.all(
        items.map((item) =>
          db.file.create({
            data: {
              url: `/uploads/resguardos/${fileName}`,
              type: "application/pdf",
              inventoryId: item.inventoryId,
              // We don't link these copies to the custody record to avoid confusion,
              // or we could, but the custody record already has a main file.
            },
          })
        )
      );
    }

    // 7. Send Email
    if (receiverUser.email) {
      try {
        await sendCustodyEmail(
          receiverUser.email,
          "Resguardo de Equipo Tecnológico",
          `Hola ${receiverUser.firstName}, se ha generado un nuevo resguardo de equipo. Adjunto encontrarás el documento.`,
          [
            {
              filename: fileName,
              content: pdfBytes,
            },
          ]
        );
      } catch (emailErr) {
        console.error("Failed to send email but record created:", emailErr);
        // Don't fail the request, just log
      }
    }

    res.status(201).json({
      message: "Resguardo creado exitosamente",
      custodyRecord: { ...custodyRecord, fileUrl: fileRecord.url },
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
          include: { inventory: true },
        },
        file: true,
      },
    });

    if (!record) {
      return res.status(404).json({ message: "Resguardo no encontrado" });
    }

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
          items: true,
        },
        orderBy,
        skip,
        take,
      }),
      db.custodyRecord.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / take);

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
