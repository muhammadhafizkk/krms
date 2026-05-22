import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },

    diagnosis: { type: String, trim: true, },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
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