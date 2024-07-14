import express from "express";
import {
  login,
  register,
  loadUser,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);
router.route("/me").get(protect, loadUser);

export default router;
