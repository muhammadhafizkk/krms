import Medication from "../models/Medication.js"

export async function getAllMedications(_, res) {
    try {
        const medications = await Medication.find()
            .limit(50)
            .sort({ createdAt: -1 })

        res.status(200).json(medications)

    } catch (error) {
        console.error("Error in getAllMedications controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function getMedicationById(req, res) {
    try {
        const medication = await Medication.findById(req.params.id)

        if (!medication) {
            return res.status(404).json({ message: "Medication not found" })
        }

        res.status(200).json(medication)

    } catch (error) {
        console.error("Error in getMedicationById controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function createMedication(req, res) {
    try {
        const {
            medicationName,
            batchNumber,
            manufacturer,
            productionDate,
            expiryDate,
            quantity,
            unit,
            price,
            supplier,
            dosage
        } = req.body

        const medicationData = {
            medicationName,
            batchNumber,
            manufacturer,
            productionDate,
            expiryDate,
            quantity,
            unit,
            price,
            supplier,
            dosage
        }

        const newMedication = new Medication(medicationData)

        const savedMedication = await newMedication.save()

        res.status(201).json(savedMedication)

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                message: "Batch number already exists"
            })
        }

        console.error("Error in createMedication controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function updateMedication(req, res) {
    try {
        const {
            medicationName,
            batchNumber,
            manufacturer,
            productionDate,
            expiryDate,
            quantity,
            unit,
            price,
            supplier,
            dosage
        } = req.body

        const medicationData = {
            medicationName,
            batchNumber,
            manufacturer,
            productionDate,
            expiryDate,
            quantity,
            unit,
            price,
            supplier,
            dosage
        }

        const updatedMedication = await Medication.findByIdAndUpdate(
            req.params.id,
            { $set: medicationData },
            { new: true, runValidators: true }
        )

        if (!updatedMedication) {
            return res.status(404).json({
                message: "Medication not found"
            })
        }

        res.status(200).json(updatedMedication)

    } catch (error) {
        console.error("Error in updateMedication controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function deleteMedication(req, res) {
    try {
        const deletedMedication = await Medication.findByIdAndDelete(req.params.id)

        if (!deletedMedication) {
            return res.status(404).json({
                message: "Medication not found"
            })
        }

        res.status(200).json({
            message: "Medication deleted successfully"
        })

    } catch (error) {
        console.error("Error in deleteMedication controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}