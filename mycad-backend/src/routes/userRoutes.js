import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

router.route("/").get(protect, getUsers);
router.route("/:id").get(protect, getUserById);

export default router;
