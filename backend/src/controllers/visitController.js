import Visit from "../models/Visit.js";
import mongoose from "mongoose";

export async function checkInPatient(req, res) {
  try {
    const { patientId, purpose } = req.body;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }

    const visit = new Visit({
      patient: patientId,
      purpose,
      status: "Checked In",
    });

    const savedVisit = await visit.save();

    res.status(201).json(savedVisit);
  } catch (error) {
    console.error("Error in checkInPatient", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTodayVisits(req, res) {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const visits = await Visit.find({
      checkInTime: { $gte: start, $lte: end },
      status: { $ne: "Completed" },
    })
      .populate("patient")
      .sort({ checkInTime: -1 });

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error in getTodayVisits", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateVisitStatus(req, res) {
  try {
    const { status } = req.body;

    const updatedVisit = await Visit.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === "Completed" && { servedTime: new Date() }),
      },
      { new: true }
    );

    if (!updatedVisit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    res.status(200).json(updatedVisit);
  } catch (error) {
    console.error("Error in updateVisitStatus", error);
    res.status(500).json({ message: "Internal server error" });
  }
}