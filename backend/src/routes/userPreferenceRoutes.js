import express from "express";
import {
  getPreferences,
  updatePreferences,
  uploadSidebarImage,
} from "../controllers/userPreferenceController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "src/uploads/preferences/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = uuidv4();
    cb(null, name + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/", protect, getPreferences);
router.put("/", protect, updatePreferences);
router.post("/upload-bg", protect, upload.single("image"), uploadSidebarImage);

export default router;
