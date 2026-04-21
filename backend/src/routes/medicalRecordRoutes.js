import express from "express"
import { createRecord, deleteRecord, getRecordById, getRecordsByPatient, updateRecord } from "../controllers/medicalRecordControllers.js";

const router = express.Router({ mergeParams: true })

router.get("/", getRecordsByPatient);
router.get("/:id", getRecordById);
router.post("/", createRecord);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);

export default router