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
    const populated = await savedVisit.populate("patient", "fullName NRIC");
    res.status(201).json(populated);
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

    // Return ALL visits today including completed — dashboard shows full picture
    const visits = await Visit.find({
      checkInTime: { $gte: start, $lte: end },
    })
      .populate("patient", "fullName NRIC")
      .sort({ checkInTime: 1 });

    res.status(200).json(visits);
  } catch (error) {
    console.error("Error in getTodayVisits", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateVisitStatus(req, res) {
  try {
    const { status } = req.body;

    const validStatuses = ["Checked In", "In Progress", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedVisit = await Visit.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === "Completed" && { servedTime: new Date() }),
      },
      { new: true }
    ).populate("patient", "fullName NRIC");

    if (!updatedVisit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    res.status(200).json(updatedVisit);
  } catch (error) {
    console.error("Error in updateVisitStatus", error);
    res.status(500).json({ message: "Internal server error" });
  }
}