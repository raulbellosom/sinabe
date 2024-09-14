import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 } from "uuid";
import sharp from "sharp";

const BASE_PATH = "src/uploads/profile/";

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

const upload = multer({ storage });

const saveProfileImage = async (req, res, next) => {
  const file = req.file || null;
  if (!file) {
    return res.status(400).json({ message: "No image uploaded" });
  }
  try {
    const { mimetype, filename } = file;
    const fileName = path.parse(filename).name;

    const thumbnailDir = path.join(BASE_PATH, "thumbnails");
    const mediumDir = path.join(BASE_PATH, "medium");
    const largeDir = path.join(BASE_PATH, "large");

    const thumbnailPath = path.join(
      thumbnailDir,
      `${fileName}-thumbnail${path.extname(filename)}`
    );
    const mediumPath = path.join(
      mediumDir,
      `${fileName}-medium${path.extname(filename)}`
    );
    const largePath = path.join(
      largeDir,
      `${fileName}-large${path.extname(filename)}`
    );

    // Crear directorios si no existen
    if (!fs.existsSync(thumbnailDir))
      fs.mkdirSync(thumbnailDir, { recursive: true });
    if (!fs.existsSync(mediumDir)) fs.mkdirSync(mediumDir, { recursive: true });
    if (!fs.existsSync(largeDir)) fs.mkdirSync(largeDir, { recursive: true });

    await sharp(file.path).resize(150, 150).toFile(thumbnailPath);
    await sharp(file.path).resize(500, 500).toFile(mediumPath);
    await sharp(file.path).resize(1000, 1000).toFile(largePath);

    const urlRelativePath = path.relative(
      "src",
      path.join(BASE_PATH, filename)
    );
    const thumbnailRelativePath = path.relative("src", thumbnailPath);
    const mediumRelativePath = path.relative("src", mediumPath);
    const largeRelativePath = path.relative("src", largePath);

    req.profileImage = {
      url: urlRelativePath,
      type: mimetype,
      metadata: { ...file },
      thumbnail: thumbnailRelativePath,
      medium: mediumRelativePath,
      large: largeRelativePath,
    };

    next();
  } catch (error) {
    console.error("Error processing profile image:", error);
    return res.status(500).json({ message: "Error processing profile image" });
  }
};

export { upload, saveProfileImage };
