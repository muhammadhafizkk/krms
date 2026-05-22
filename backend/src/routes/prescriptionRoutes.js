import express from "express";
import {
  getPrescriptionByRecord,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  dispensePrescription,
  deletePrescription,
} from "../controllers/prescriptionController.js";

const router = express.Router();

router.get("/record/:medicalRecordId", getPrescriptionByRecord);
router.get("/:id", getPrescriptionById);
router.post("/", createPrescription);
router.put("/:id", updatePrescription);
router.put("/:id/dispense", dispensePrescription);
router.delete("/:id", deletePrescription);

export default router;