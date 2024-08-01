import multer, { diskStorage } from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import { v4 } from "uuid";

let basePath = "src/uploads/vehicles/";

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dir = file.mimetype.includes("image")
      ? `${basePath}images/`
      : `${basePath}files/`;
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
      const fileName = path.parse(file.filename).name;

      const thumbnailPath = `${basePath}/images/thumbnails/${fileName}-thumbnail.jpg`;
      const mediumPath = `${basePath}images/medium/${fileName}-medium.jpg`;
      const largePath = `${basePath}images/large/${fileName}-large.jpg`;

      if (!fs.existsSync(`${basePath}images/thumbnails/`)) {
        fs.mkdirSync(`${basePath}images/thumbnails/`, {
          recursive: true,
        });
      }
      if (!fs.existsSync(`${basePath}images/medium/`)) {
        fs.mkdirSync(`${basePath}images/medium/`, { recursive: true });
      }
      if (!fs.existsSync(`${basePath}images/large/`)) {
        fs.mkdirSync(`${basePath}images/large/`, { recursive: true });
      }

      await sharp(file.path).resize(150, 150).toFile(thumbnailPath);

      await sharp(file.path).resize(500, 500).toFile(mediumPath);

      await sharp(file.path).resize(1000, 1000).toFile(largePath);

      basePath = basePath.replace("src/", "");
      let thumbnailRelativePath = thumbnailPath.split("src/")[1];
      let mediumRelativePath = mediumPath.split("src/")[1];
      let largeRelativePath = largePath.split("src/")[1];
      return {
        url: `${basePath}images/${file.filename}`,
        type: file.mimetype,
        metadata: file,
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
