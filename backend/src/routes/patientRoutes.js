import express from "express"
import { createPatient, deletePatient, getAllPatients, updatePatient, getPatientById } from "../controllers/patientsController.js"

const router = express.Router()

router.get("/", getAllPatients)
router.get("/:id", getPatientById)
router.post("/", createPatient)
router.put("/:id", updatePatient)
router.delete("/:id", deletePatient)

export default router