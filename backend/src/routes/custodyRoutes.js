import express from "express";
import {
  createCustodyRecord,
  getCustodyRecord,
  getCustodyRecords,
  deleteCustodyRecord,
} from "../controllers/custodyController.js";

const router = express.Router();

router.post("/", createCustodyRecord);
router.get("/:id", getCustodyRecord);
router.get("/", getCustodyRecords);
router.delete("/:id", deleteCustodyRecord);

export default router;
