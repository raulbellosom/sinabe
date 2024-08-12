import multer, { diskStorage } from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import { v4 } from "uuid";

const BASE_PATH = "src/uploads/vehicles/";

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dir = file.mimetype.includes("image")
      ? `${BASE_PATH}images/`
      : `${BASE_PATH}files/`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = v4();
    cb(null, name + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const processImages = async (req, res, next) => {
  if (!req.files) {
    return next();
  }

  const imageFiles = req.files["images"] || [];

  const processedFiles = await Promise.all(
    imageFiles.map(async (file) => {
      const { originalname, mimetype, size, path: originalpath } = file;
      const fileName = path.parse(file.filename).name;

      const thumbnailDir = `${BASE_PATH}images/thumbnails/`;
      const mediumDir = `${BASE_PATH}images/medium/`;
      const largeDir = `${BASE_PATH}images/large/`;

      const thumbnailPath = `${thumbnailDir}${fileName}-thumbnail.jpg`;
      const mediumPath = `${mediumDir}${fileName}-medium.jpg`;
      const largePath = `${largeDir}${fileName}-large.jpg`;

      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }
      if (!fs.existsSync(mediumDir)) {
        fs.mkdirSync(mediumDir, { recursive: true });
      }
      if (!fs.existsSync(largeDir)) {
        fs.mkdirSync(largeDir, { recursive: true });
      }

      await sharp(file.path).resize(150, 150).toFile(thumbnailPath);

      await sharp(file.path).resize(500, 500).toFile(mediumPath);

      await sharp(file.path).resize(1000, 1000).toFile(largePath);

      let urlRelativePath = BASE_PATH.replace("src/", "");
      let thumbnailRelativePath = thumbnailPath.split("src/")[1];
      let mediumRelativePath = mediumPath.split("src/")[1];
      let largeRelativePath = largePath.split("src/")[1];
      return {
        url: `${urlRelativePath}images/${file.filename}`,
        type: file.mimetype,
        metadata: { originalname, mimetype, size, path: originalpath },
        thumbnail: thumbnailRelativePath,
        medium: mediumRelativePath,
        large: largeRelativePath,
      };
    })
  );

  req.processedFiles = processedFiles;
  next();
};

export { upload, processImages };
