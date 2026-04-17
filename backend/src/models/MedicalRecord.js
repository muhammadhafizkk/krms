import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, },

    diagnosis: { type: String, trim: true, },
    prescription: [
      {
        medication: { type: String, required: true, trim: true },
        dosage: { type: String, required: true },
        instructions: { type: String },
      },
    ],
    allergies: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: { type: String, },
  },
  { timestamps: true, }
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord