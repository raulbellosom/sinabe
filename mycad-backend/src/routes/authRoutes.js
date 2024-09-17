import express from "express";
import {
  login,
  register,
  loadUser,
  logout,
  updatePassword,
  updateProfile,
  updateProfileImage,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload, saveProfileImage } from "../utils/saveProfileImage.js";
import { verifyRole } from "../middleware/authorization.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);
router.route("/me").get(protect, loadUser);
router.put(
  "/updateProfile",
  protect,
  verifyRole("users", "UPDATE"),
  updateProfile
);
router.put(
  "/updateProfileImage",
  protect,
  verifyRole("users", "UPDATE"),
  upload.single("profileImage"),
  saveProfileImage,
  updateProfileImage
);
router.put(
  "/updatePassword",
  protect,
  verifyRole("users", "UPDATE"),
  updatePassword
);

export default router;
