import Patient from "../models/Patient.js"

export async function getAllPatients(_, res){
    try {
        const patients = await Patient.find().limit(50).sort({ createdAt: -1 }); // Gets everything from Atlas
        res.status(200).json(patients)

    } catch (error) {
        console.error("Error in getAllPatients controller", error)
        res.status(500).json({message: "Internal server error"})
    }
}

export async function getPatientById(req,res){
    try {
        const patient = await Patient.findById(req.params.id)
        if (!patient) return res.status(404).json({message: "Patient not found"})
        
        res.status(200).json(patient)
    } catch (error) {
        console.error("Error in getPatientById controller", error)
        res.status(500).json({message: "Internal server error"})
    }
}

export async function createPatient(req, res){
    try {
        const { fullName, NRIC, dateOfBirth, race, sex, address, contactNumber } = req.body
        const patientData = { fullName, NRIC, dateOfBirth, race, sex, address, contactNumber }

        const newPatient = new Patient(patientData)

        const savedPatient = await newPatient.save()
        res.status(201).json(savedPatient)

    } catch (error) {
        console.error("Error in createPatient controller", error)
        res.status(500).json({message: "Internal server error"})
    }
}

export async function updatePatient(req,res){
    try {
        const { fullName, NRIC, dateOfBirth, race, sex, address, contactNumber } = req.body
        const patientData = { fullName, NRIC, dateOfBirth, race, sex, address, contactNumber }

        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        )

        if(!updatedPatient) return res.status(404).json({message: "Patient not found"})
        
        res.status(200).json(updatedPatient)
    } catch (error) {
        console.error("Error in updatePatient controller", error)
        res.status(500).json({message: "Internal server error"})
    }
}

export async function deletePatient(req,res){
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id)

        if(!deletedPatient) return res.status(404).json({message: "Patient not found"})
        
        res.status(200).json({ message: "Patient deleted successfully" })
    } catch (error) {
        console.error("Error in deletePatient controller", error)
        res.status(500).json({message: "Internal server error"})
    }
}