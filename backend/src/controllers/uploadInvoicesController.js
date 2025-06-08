// controllers/uploadInvoicesController.js
import multer, { diskStorage } from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const BASE_PATH = "src/uploads/projects/invoices/";

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dir = `${BASE_PATH}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${name}${ext}`);
  },
});

const uploadInvoiceFiles = multer({ storage });

const processInvoiceFiles = (req, res, next) => {
  if (!req.files) return next();

  req.invoiceData = {
    pdfUrl: req.files["factura"]?.[0]
      ? `/uploads/projects/invoices/${req.files["factura"][0].filename}`
      : null,
    xmlUrl: req.files["xml"]?.[0]
      ? `/uploads/projects/invoices/${req.files["xml"][0].filename}`
      : null,
    metadata: {
      factura: req.files["factura"]?.[0] || null,
      xml: req.files["xml"]?.[0] || null,
    },
  };

  next();
};

export { uploadInvoiceFiles, processInvoiceFiles };
