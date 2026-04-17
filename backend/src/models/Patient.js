import mongoose from "mongoose"

//1. Create schema
const patientSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    NRIC: { type: String, required: true, unique:true },
    dateOfBirth: { type: Date, required: true },
    race: { type: String, required: true },
    sex: { type: String, enum: ["Male", "Female", "Other"], required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
  },
  { timestamps: true }
);

//2. Create model based on schema
const Patient = mongoose.model("Patient", patientSchema);

export default Patient
