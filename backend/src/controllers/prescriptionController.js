import Prescription from "../models/Prescription.js";
import Medication from "../models/Medication.js";
import MedicalRecord from "../models/MedicalRecord.js";
import mongoose from "mongoose";

// GET /api/prescriptions/record/:medicalRecordId
// Get the prescription linked to a medical record
export async function getPrescriptionByRecord(req, res) {
  try {
    const { medicalRecordId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(medicalRecordId)) {
      return res.status(400).json({ message: "Invalid medical record ID" });
    }

    const prescription = await Prescription.findOne({
      medicalRecord: medicalRecordId,
    })
      .populate("patient", "fullName NRIC")
      .populate("doctor", "fullName medicalLicenseNumber")
      .populate("items.medication", "medicationName dosage unit dispensingCategory");

    if (!prescription) {
      return res.status(404).json({ message: "No prescription found for this record" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.error("Error in getPrescriptionByRecord controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/prescriptions/:id
// Get a single prescription by its own ID
export async function getPrescriptionById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid prescription ID" });
    }

    const prescription = await Prescription.findById(id)
      .populate("patient", "fullName NRIC")
      .populate("doctor", "fullName medicalLicenseNumber")
      .populate("items.medication", "medicationName dosage unit dispensingCategory");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.error("Error in getPrescriptionById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/prescriptions
// Create a new prescription linked to a medical record
export async function createPrescription(req, res) {
  try {
    const { medicalRecord, patient, doctor, items } = req.body;

    if (!medicalRecord || !patient || !doctor || !items?.length) {
      return res.status(400).json({
        message: "medicalRecord, patient, doctor, and at least one item are required",
      });
    }

    // Validate all medications exist and are Prescription-only category
    for (const item of items) {
      const medication = await Medication.findById(item.medication);
      if (!medication) {
        return res.status(404).json({
          message: `Medication not found: ${item.medication}`,
        });
      }
      if (medication.dispensingCategory !== "Prescription") {
        return res.status(400).json({
          message: `${medication.medicationName} is an OTC medication and does not require a prescription`,
        });
      }
    }

    // Check no prescription already exists for this medical record
    const existing = await Prescription.findOne({ medicalRecord });
    if (existing) {
      return res.status(400).json({
        message: "A prescription already exists for this medical record",
      });
    }

    const prescription = new Prescription({ medicalRecord, patient, doctor, items });
    const saved = await prescription.save();

    // Write the prescription ref back onto the MedicalRecord
    await MedicalRecord.findByIdAndUpdate(medicalRecord, {
      prescription: saved._id,
    });

    const populated = await saved.populate([
      { path: "patient", select: "fullName NRIC" },
      { path: "doctor", select: "fullName medicalLicenseNumber" },
      { path: "items.medication", select: "medicationName dosage unit dispensingCategory" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error in createPrescription controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/prescriptions/:id
// Update prescription items (only allowed before dispensing)
export async function updatePrescription(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid prescription ID" });
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    if (prescription.dispensed) {
      return res.status(400).json({
        message: "Cannot edit a prescription that has already been dispensed",
      });
    }

    const { items } = req.body;

    // Validate all medications exist and are Prescription-only
    for (const item of items) {
      const medication = await Medication.findById(item.medication);
      if (!medication) {
        return res.status(404).json({
          message: `Medication not found: ${item.medication}`,
        });
      }
      if (medication.dispensingCategory !== "Prescription") {
        return res.status(400).json({
          message: `${medication.medicationName} is an OTC medication and does not require a prescription`,
        });
      }
    }

    prescription.items = items;
    await prescription.save();

    const populated = await prescription.populate([
      { path: "patient", select: "fullName NRIC" },
      { path: "doctor", select: "fullName medicalLicenseNumber" },
      { path: "items.medication", select: "medicationName dosage unit dispensingCategory" },
    ]);

    res.status(200).json(populated);
  } catch (error) {
    console.error("Error in updatePrescription controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/prescriptions/:id/dispense
// Dispense prescription — deducts stock from each medication
export async function dispensePrescription(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid prescription ID" });
    }

    const prescription = await Prescription.findById(id)
      .populate("items.medication")
      .session(session);

    if (!prescription) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Prescription not found" });
    }

    if (prescription.dispensed) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Prescription has already been dispensed" });
    }

    // Check sufficient stock for every item before deducting anything
    for (const item of prescription.items) {
      const medication = item.medication;
      if (medication.quantity < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for ${medication.medicationName}. Available: ${medication.quantity} ${medication.unit}`,
        });
      }
    }

    // Deduct stock for each item
    for (const item of prescription.items) {
      await Medication.findByIdAndUpdate(
        item.medication._id,
        { $inc: { quantity: -item.quantity } },
        { session }
      );
    }

    // Mark as dispensed
    prescription.dispensed = true;
    prescription.dispensedAt = new Date();
    await prescription.save({ session });

    await session.commitTransaction();

    const populated = await prescription.populate([
      { path: "patient", select: "fullName NRIC" },
      { path: "doctor", select: "fullName medicalLicenseNumber" },
      { path: "items.medication", select: "medicationName dosage unit dispensingCategory quantity" },
    ]);

    res.status(200).json(populated);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in dispensePrescription controller", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
}

// DELETE /api/prescriptions/:id
// Delete a prescription (only allowed before dispensing)
export async function deletePrescription(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid prescription ID" });
    }

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    if (prescription.dispensed) {
      return res.status(400).json({
        message: "Cannot delete a prescription that has already been dispensed",
      });
    }

    await prescription.deleteOne();
    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("Error in deletePrescription controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}