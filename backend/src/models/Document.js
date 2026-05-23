import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "medical-checkup",
        "referral",
        "time-slip",
        "sick-leave",
        "cuti-sekolah",
        "receipt",
      ],
      required: true,
    },
    serialNumber: {
      type: String,
      default: null,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;