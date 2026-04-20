import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    purpose: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Checked In", "In Progress", "Completed"],
      default: "Checked In",
    },

    checkInTime: {
      type: Date,
      default: Date.now,
    },

    servedTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Visit =  mongoose.model("Visit", visitSchema);

export default Visit