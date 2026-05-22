import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicalRecord",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        medication: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medication",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        dosage: {
          type: String,
          required: true,
        },
        instructions: {
          type: String,
        },
      },
    ],
    dispensed: {
      type: Boolean,
      default: false,
    },
    dispensedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;