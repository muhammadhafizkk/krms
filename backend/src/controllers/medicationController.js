import Medication from "../models/Medication.js"

export async function getAllMedications(req, res) {
    try {
        // ?alert=true — returns low stock OR near expiry OR already expired medications
        if (req.query.alert === "true") {
            const now = new Date();
            const in30Days = new Date();
            in30Days.setDate(now.getDate() + 30);

            const alertMedications = await Medication.find({
                $or: [
                    { quantity: { $lte: 10 } },
                    { expiryDate: { $lte: in30Days } },
                ]
            }).sort({ expiryDate: 1 });

            // Attach an alertType to each so the frontend knows what to show
            const withAlertType = alertMedications.map((med) => {
                const obj = med.toObject();
                const alerts = [];

                if (med.quantity === 0) {
                    alerts.push("out_of_stock");
                } else if (med.quantity <= 10) {
                    alerts.push("low_stock");
                }

                if (med.expiryDate < now) {
                    alerts.push("expired");
                } else if (med.expiryDate <= in30Days) {
                    alerts.push("expiring_soon");
                }

                obj.alerts = alerts;
                return obj;
            });

            return res.status(200).json(withAlertType);
        }

        // Default — return all medications
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
            dosage,
            dispensingCategory,
        } = req.body

        const newMedication = new Medication({
            medicationName,
            batchNumber,
            manufacturer,
            productionDate,
            expiryDate,
            quantity,
            unit,
            price,
            supplier,
            dosage,
            dispensingCategory,
        })

        const savedMedication = await newMedication.save()
        res.status(201).json(savedMedication)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Batch number already exists" })
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
            dosage,
            dispensingCategory,
        } = req.body

        const updatedMedication = await Medication.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    medicationName,
                    batchNumber,
                    manufacturer,
                    productionDate,
                    expiryDate,
                    quantity,
                    unit,
                    price,
                    supplier,
                    dosage,
                    dispensingCategory,
                }
            },
            { new: true, runValidators: true }
        )

        if (!updatedMedication) {
            return res.status(404).json({ message: "Medication not found" })
        }

        res.status(200).json(updatedMedication)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Batch number already exists" })
        }
        console.error("Error in updateMedication controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export async function deleteMedication(req, res) {
    try {
        const deletedMedication = await Medication.findByIdAndDelete(req.params.id)

        if (!deletedMedication) {
            return res.status(404).json({ message: "Medication not found" })
        }

        res.status(200).json({ message: "Medication deleted successfully" })
    } catch (error) {
        console.error("Error in deleteMedication controller", error)
        res.status(500).json({ message: "Internal server error" })
    }
}