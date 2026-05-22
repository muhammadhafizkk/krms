import WalkInSale from "../models/WalkInSale.js";
import Medication from "../models/Medication.js";
import mongoose from "mongoose";

// GET /api/walkin-sales
export async function getAllSales(req, res) {
  try {
    const sales = await WalkInSale.find()
      .populate("processedBy", "fullName role")
      .populate("items.medication", "medicationName dosage unit price dispensingCategory")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error in getAllSales controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/walkin-sales/:id
export async function getSaleById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid sale ID" });
    }

    const sale = await WalkInSale.findById(id)
      .populate("processedBy", "fullName role")
      .populate("items.medication", "medicationName dosage unit price dispensingCategory");

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    res.status(200).json(sale);
  } catch (error) {
    console.error("Error in getSaleById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/walkin-sales
// Creates the sale and deducts stock atomically
export async function createSale(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, processedBy } = req.body;

    if (!items?.length) {
      await session.abortTransaction();
      return res.status(400).json({ message: "At least one item is required" });
    }

    if (!processedBy) {
      await session.abortTransaction();
      return res.status(400).json({ message: "processedBy is required" });
    }

    // Validate each item: must exist, must be OTC, must have stock
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.medication)) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Invalid medication ID: ${item.medication}` });
      }

      const medication = await Medication.findById(item.medication).session(session);

      if (!medication) {
        await session.abortTransaction();
        return res.status(404).json({ message: `Medication not found: ${item.medication}` });
      }

      if (medication.dispensingCategory !== "OTC") {
        await session.abortTransaction();
        return res.status(400).json({
          message: `${medication.medicationName} requires a prescription and cannot be sold over the counter`,
        });
      }

      if (medication.quantity < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for ${medication.medicationName}. Available: ${medication.quantity} ${medication.unit}`,
        });
      }
    }

    // Deduct stock for each item
    for (const item of items) {
      await Medication.findByIdAndUpdate(
        item.medication,
        { $inc: { quantity: -item.quantity } },
        { session }
      );
    }

    // Create the sale record
    const [sale] = await WalkInSale.create([{ items, processedBy }], { session });

    await session.commitTransaction();

    // Populate after commit
    const populated = await WalkInSale.findById(sale._id)
      .populate("processedBy", "fullName role")
      .populate("items.medication", "medicationName dosage unit price dispensingCategory");

    res.status(201).json(populated);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createSale controller", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
}