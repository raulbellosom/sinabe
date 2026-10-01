import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 } from "uuid";
import sharp from "sharp";

const BASE_PATH = "src/uploads/signatures/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(BASE_PATH)) {
      fs.mkdirSync(BASE_PATH, { recursive: true });
    }
    cb(null, BASE_PATH);
  },
  filename: (req, file, cb) => {
    const name = v4();
    cb(null, name + path.extname(file.originalname));
  },
});

const uploadSignature = multer({ storage });

const saveSignature = async (req, res, next) => {
  const file = req.file || null;
  try {
    if (!file) {
      next();
    } else {
      const { mimetype, filename } = file;

      // Ensure directory exists (redundant but safe)
      if (!fs.existsSync(BASE_PATH)) {
        fs.mkdirSync(BASE_PATH, { recursive: true });
      }

      // The frontend already sends a normalized 1000x400 PNG; this only caps
      // oversized uploads, maintaining aspect ratio.
      const tempPath = file.path + ".tmp";
      await sharp(file.path)
        .resize(1000, null, { withoutEnlargement: true })
        .toFile(tempPath);

      fs.unlinkSync(file.path); // Remove original
      fs.renameSync(tempPath, file.path); // Rename resized to original name

      const urlRelativePath = path.relative(
        "src",
        path.join(BASE_PATH, filename)
      );

      req.signatureImage = {
        url: urlRelativePath,
        type: "SIGNATURE", // Explicit type for DB
        metadata: { ...file, mimetype },
        thumbnail: null, // No thumbnail for signatures usually
      };

      next();
    }
  } catch (error) {
    console.error("Error processing signature image:", error);
    return res
      .status(500)
      .json({ message: "Error processing signature image" });
  }
};

export { uploadSignature, saveSignature };
