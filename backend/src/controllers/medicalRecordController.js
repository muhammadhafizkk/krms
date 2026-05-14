import MedicalRecord from "../models/MedicalRecord.js"
import mongoose from "mongoose"

export async function getRecordsByPatient(req,res){
    try {
        const { patientId } = req.params

        if (!mongoose.Types.ObjectId.isValid(patientId)){
            return res.status(400).json({ message: "Invalid patient ID"})
        }

        const records = await MedicalRecord.find({ patient: patientId })
            .populate("doctor", "fullName email medicalLicenseNumber")
            .sort({ createdAt: -1 })

        res.status(200).json(records)
    } catch (error) {
        console.error("Error in getRecordsByPatient controller", error)
        res.status(500).json({ message: "Internal server error"})
    }
}

export async function getRecordById(req,res){
    try {
        const { patientId, id } = req.params
        
        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "Invalid record ID"})
        }

        const record = await MedicalRecord.findOne({ _id: id, patient: patientId })
            .populate("doctor", "name email")
        
        if (!record) return res.status(404).json({ message: "Medical record not found"})

        res.status(200).json(record)
    } catch (error) {
        console.error("Error in getRecordById controller", error)
        res.status(500).json({ message: "Internal server error"})
    }
}

export async function createRecord(req,res){
    try {
        const { patientId } = req.params

        if (!mongoose.Types.ObjectId.isValid(patientId)){
            return res.status(400).json({ message: "Invalid patient ID"})
        }

        const { doctor, diagnosis, prescription, allergies, notes } = req.body

        const newRecord = new MedicalRecord({
            patient: patientId,
            doctor,
            diagnosis,
            prescription,
            allergies,
            notes
        })

        const savedRecord = await newRecord.save()
        res.status(201).json(savedRecord)
    } catch (error) {
        console.error("Error in createRecord controller", error)
        res.status(500).json({ message:"Internal server error"})
    }
}

export async function updateRecord(req, res){
    try {
        const { patientId, id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "Invalid record ID"})
        }

        const updatedRecord = await MedicalRecord.findOneAndUpdate(
            { _id: id, patient: patientId },
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate("doctor", "fullName email medicalLicenseNumber")

        if (!updatedRecord) return res.status(404).json({ message: "Medical record not found"})

        res.status(200).json(updatedRecord)
    } catch (error) {
        console.error("Error in updateRecord controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function deleteRecord(req, res){
    try {
        const { patientId, id } = req.params

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "Invalid record ID"})
        }

        const deletedRecord = await MedicalRecord.findOneAndDelete(
            {_id:id, patient:patientId}
        )

        if (!deletedRecord) return res.status(404).json({message: "Medical record not found"})

        res.status(200).json({message: "Medical record deleted succcessfully"})
    } catch (error) {
        console.error("Error in deleteRecord controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}