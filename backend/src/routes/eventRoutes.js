import express from "express";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // All routes protected

router.get("/", checkPermission("view_events"), getEvents);
router.post("/", checkPermission("create_events"), createEvent);
router.put("/:id", checkPermission("edit_events"), updateEvent);
router.delete("/:id", checkPermission("delete_events"), deleteEvent);

export default router;
