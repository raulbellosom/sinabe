// controllers/uploadProjectDocumentsController.js
import multer, { diskStorage } from "multer";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const BASE_PATH = "src/uploads/projects/documents/";

const storage = diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(BASE_PATH)) {
      fs.mkdirSync(BASE_PATH, { recursive: true });
    }
    cb(null, BASE_PATH);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = uuidv4();
    cb(null, name + ext);
  },
});

const uploadProjectDocument = multer({ storage });

export { uploadProjectDocument };
