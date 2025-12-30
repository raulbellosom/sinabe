import { db } from "../lib/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to delete file
const deleteFile = (filePath) => {
  // filePath is like "uploads/preferences/filename.jpg"
  // We need to resolve it to absolute path
  // __dirname is .../backend/src/controllers
  // We want .../backend/src/uploads/preferences/filename.jpg
  // So go up one level from controllers to src
  const fullPath = path.join(__dirname, "../", filePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  }
};

export const getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    let preference = await db.userPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      preference = await db.userPreference.create({
        data: { userId },
      });
    }

    res.json(preference);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching preferences" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sidebarBgId, columnSettings, preferences } = req.body;

    const data = {};

    // If sidebarBgId is provided (1-4), we set it.
    // If it is set, we should probably clear the custom image to avoid ambiguity,
    // as the user likely wants to switch to a preset.
    if (sidebarBgId !== undefined) {
      data.sidebarBgId = sidebarBgId;

      if (sidebarBgId !== null) {
        const current = await db.userPreference.findUnique({
          where: { userId },
        });
        if (current?.sidebarBgUrl) {
          deleteFile(current.sidebarBgUrl);
          data.sidebarBgUrl = null;
        }
      }
    }

    if (columnSettings !== undefined) data.columnSettings = columnSettings;
    if (preferences !== undefined) data.preferences = preferences;

    // Use upsert to handle both create (if new user) and update (if existing)
    // This prevents errors when updating preferences for a user that doesn't have a record yet
    const preference = await db.userPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    res.json(preference);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating preferences" });
  }
};

export const uploadSidebarImage = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const filename = req.file.filename;
    const dir = path.dirname(filePath);
    const name = path.parse(filename).name;

    // Optimize image: Resize to max 1080x1920 (typical sidebar ratio), convert to JPEG, quality 80
    const optimizedFilename = `${name}-optimized.jpg`;
    const optimizedPath = path.join(dir, optimizedFilename);

    await sharp(filePath)
      .resize({
        width: 1920,
        height: 2560,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 95, mozjpeg: true })
      .toFile(optimizedPath);

    // Delete original upload
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Error deleting original file:", err);
    }

    const relativePath = `uploads/preferences/${optimizedFilename}`;

    // Find existing to delete old image
    const current = await db.userPreference.findUnique({
      where: { userId },
    });
    if (current?.sidebarBgUrl) {
      deleteFile(current.sidebarBgUrl);
    }

    const preference = await db.userPreference.upsert({
      where: { userId },
      update: {
        sidebarBgUrl: relativePath,
        sidebarBgId: null, // Clear preset ID when custom image is uploaded
      },
      create: {
        userId,
        sidebarBgUrl: relativePath,
      },
    });

    res.json(preference);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading image" });
  }
};
