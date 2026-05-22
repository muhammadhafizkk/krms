import mongoose from "mongoose";

const walkInSaleSchema = new mongoose.Schema(
  {
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
      },
    ],
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const WalkInSale = mongoose.model("WalkInSale", walkInSaleSchema);

export default WalkInSale;