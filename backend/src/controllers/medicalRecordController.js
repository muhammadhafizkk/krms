import MedicalRecord from "../models/MedicalRecord.js"
import Prescription from "../models/Prescription.js"
import mongoose from "mongoose"

export async function getRecordsByPatient(req, res) {
    try {
        const { patientId } = req.params

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: "Invalid patient ID" })
        }

        const records = await MedicalRecord.find({ patient: patientId })
            .populate("doctor", "fullName email medicalLicenseNumber")
            .populate({
                path: "prescription",
                populate: {
                    path: "items.medication",
                    select: "medicationName dosage unit dispensingCategory"
                }
            })
            .sort({ createdAt: -1 })

        res.status(200).json(records)
    } catch (error) {
        console.error("Error in getRecordsByPatient controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function getRecordById(req, res) {
    try {
        const { patientId, id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid record ID" })
        }

        const record = await MedicalRecord.findOne({ _id: id, patient: patientId })
            .populate("doctor", "fullName email medicalLicenseNumber")
            .populate({
                path: "prescription",
                populate: {
                    path: "items.medication",
                    select: "medicationName dosage unit dispensingCategory"
                }
            })

        if (!record) return res.status(404).json({ message: "Medical record not found" })

        res.status(200).json(record)
    } catch (error) {
        console.error("Error in getRecordById controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function createRecord(req, res) {
    try {
        const { patientId } = req.params

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: "Invalid patient ID" })
        }

        // prescription is excluded — it is created separately via /api/prescriptions
        const { doctor, diagnosis, allergies, notes } = req.body

        const newRecord = new MedicalRecord({
            patient: patientId,
            doctor,
            diagnosis,
            allergies,
            notes,
        })

        const savedRecord = await newRecord.save()

        const populated = await savedRecord.populate("doctor", "fullName email medicalLicenseNumber")

        res.status(201).json(populated)
    } catch (error) {
        console.error("Error in createRecord controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function updateRecord(req, res) {
    try {
        const { patientId, id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid record ID"
            })
        }

        const { prescription: _ignored, ...safeBody } = req.body

        const record = await MedicalRecord.findOne({
            _id: id,
            patient: patientId
        })

        if (!record) {
            return res.status(404).json({
                message: "Medical record not found"
            })
        }

        const EDIT_WINDOW_MS = 20 * 60 * 1000

        const createdAt = new Date(record.createdAt)
        const now = new Date()

        const isEditable =
            now.getTime() - createdAt.getTime() < EDIT_WINDOW_MS

        if (!isEditable) {
            return res.status(403).json({
                message:
                    "Medical record can only be edited within 20 minutes"
            })
        }

        Object.assign(record, safeBody)

        await record.save()

        const updatedRecord = await MedicalRecord.findById(record._id)
            .populate(
                "doctor",
                "fullName email medicalLicenseNumber"
            )
            .populate({
                path: "prescription",
                populate: {
                    path: "items.medication",
                    select:
                        "medicationName dosage unit dispensingCategory"
                }
            })

        res.status(200).json(updatedRecord)

    } catch (error) {
        console.error("Error in updateRecord controller", error)

        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export async function deleteRecord(req, res) {
    try {
        const { patientId, id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid record ID" })
        }

        const record = await MedicalRecord.findOne({ _id: id, patient: patientId })
        if (!record) return res.status(404).json({ message: "Medical record not found" })

        // Also delete the linked prescription if one exists
        if (record.prescription) {
            const prescription = await Prescription.findById(record.prescription)
            if (prescription && !prescription.dispensed) {
                await prescription.deleteOne()
            }
        }

        await record.deleteOne()
        res.status(200).json({ message: "Medical record deleted successfully" })
    } catch (error) {
        console.error("Error in deleteRecord controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}