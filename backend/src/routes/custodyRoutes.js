import express from "express";
import {
  createCustodyRecord,
  getCustodyRecord,
  getCustodyRecords,
  deleteCustodyRecord,
  getCustodyRecordByToken,
  updateCustodyRecord,
  resendCustodyEmail,
  getPublicLink,
  submitPublicSignature,
} from "../controllers/custodyController.js";

const router = express.Router();

router.post("/", createCustodyRecord);
router.put("/:id", updateCustodyRecord);
router.get("/public/:token", getCustodyRecordByToken);
router.post("/public/:token/signature", submitPublicSignature);
router.post("/:id/resend-email", resendCustodyEmail);
router.get("/:id/public-link", getPublicLink);
router.get("/:id", getCustodyRecord);
router.get("/", getCustodyRecords);
router.delete("/:id", deleteCustodyRecord);

export default router;
