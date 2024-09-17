import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
} from "../controllers/userController.js";
import { verifyRole } from "../middleware/authorization.js";
import { saveProfileImage, upload } from "../utils/saveProfileImage.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getUsers)
  .post(protect, verifyRole("users", "CREATE"), createUser);
router.route("/search").get(protect, verifyRole("users", "READ"), searchUsers);
router
  .route("/:id")
  .get(protect, verifyRole("users", "READ"), getUserById)
  .put(
    protect,
    verifyRole("users", "UPDATE"),
    upload.single("profileImage"),
    saveProfileImage,
    updateUser
  )
  .delete(protect, verifyRole("users", "DELETE"), deleteUser);

export default router;
