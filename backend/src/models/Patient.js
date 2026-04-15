import mongoose from "mongoose"

//1. Create schema
const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    status: { type: String, default: "Stable" },
  },
  { timestamps: true }
);

//2. Create model based on schema
const Patient = mongoose.model("Patient", patientSchema);

export default Patient
