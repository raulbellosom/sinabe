import express from "express";
import {
  login,
  register,
  loadUser,
  logout,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", loadUser);
router.get("/logout", logout);

export default router;
