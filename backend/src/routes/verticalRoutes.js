import express from "express";
import {
  getVerticals,
  createVertical,
  updateVertical,
  deleteVertical,
  assignVerticalsToModel,
  getModelVerticals,
  removeVerticalFromModel,
} from "../controllers/verticalController.js";

const router = express.Router();

router.get("/", getVerticals); // con modelos e inventarios
router.post("/", createVertical);
router.put("/:id", updateVertical);
router.delete("/:id", deleteVertical);

router.get("/model/:modelId", getModelVerticals);
router.post("/model/:modelId", assignVerticalsToModel);
router.delete("/model/:modelId/:verticalId", removeVerticalFromModel);

export default router;
