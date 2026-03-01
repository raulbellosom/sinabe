import express from "express";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  changeUserPassword,
} from "../controllers/userController.js";
import { saveProfileImage, upload } from "../utils/saveProfileImage.js";

const router = express.Router();

router
  .route("/")
  .get(protect, checkPermission("view_users"), getUsers)
  .post(
    protect,
    checkPermission("create_users"),
    upload.single("profileImage"),
    saveProfileImage,
    createUser,
  );
router
  .route("/search")
  .get(protect, checkPermission("view_users"), searchUsers);
router
  .route("/:id")
  .get(protect, checkPermission("view_users"), getUserById)
  .put(
    protect,
    checkPermission("edit_users"),
    upload.single("profileImage"),
    saveProfileImage,
    updateUser,
  )
  .delete(protect, checkPermission("delete_users"), deleteUser);
router
  .route("/changePassword/:id")
  .put(protect, checkPermission("edit_users"), changeUserPassword);

export default router;
