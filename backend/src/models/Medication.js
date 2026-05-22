import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    medicationName: {
      type: String,
      required: true,
      trim: true
    },

    batchNumber: {
      type: String,
      required: true,
      unique: true
    },

    manufacturer: {
      type: String,
      required: true
    },

    productionDate: {
      type: Date,
      required: true
    },

    expiryDate: {
      type: Date,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 0
    },

    unit: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    supplier: {
      type: String,
      required: true
    },

    dosage: {
      type: String,
      required: true
    },

    dispensingCategory: {
      type: String,
      enum: ["OTC", "Prescription"],
      required: true
    }
  },
  { timestamps: true }
);

const Medication = mongoose.model("Medication", medicationSchema);

export default Medication;