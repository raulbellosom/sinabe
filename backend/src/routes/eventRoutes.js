import express from "express";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected

router.get("/", getEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
