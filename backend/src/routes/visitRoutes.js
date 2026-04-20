import express from "express";
import {
  checkInPatient,
  getTodayVisits,
  updateVisitStatus,
} from "../controllers/visitController.js";

const router = express.Router();

router.post("/checkin", checkInPatient);
router.get("/today", getTodayVisits);
router.put("/:id", updateVisitStatus);

export default router;