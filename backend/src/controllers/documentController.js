import Document from "../models/Document.js";
import Counter from "../models/Counter.js";
import Patient from "../models/Patient.js";

// Serial number config — only these types get one
const SERIAL_TYPES = {
  "sick-leave": { counter: "sick_leave", prefix: "SL" },
  "receipt": { counter: "receipt", prefix: "RC" },
};

export const generateDocument = async (req, res) => {
  const { type, patientId, data } = req.body;

  if (!type || !patientId || !data) {
    return res.status(400).json({ message: "type, patientId, and data are required" });
  }

  try {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    let serialNumber = null;
    if (SERIAL_TYPES[type]) {
      const { counter, prefix } = SERIAL_TYPES[type];
      const seq = await Counter.nextSeq(counter);
      serialNumber = `${prefix}-${String(seq).padStart(5, "0")}`;
    }

    const document = await Document.create({
      type,
      serialNumber,
      patient: patientId,
      generatedBy: req.user._id,
      data,
    });

    await document.populate("patient", "fullName icNumber");
    await document.populate("generatedBy", "fullName");

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDocuments = async (req, res) => {
  const { type, patientId } = req.query;

  try {
    const filter = {};
    if (type) filter.type = type;
    if (patientId) filter.patient = patientId;

    const documents = await Document.find(filter)
      .populate("patient", "fullName icNumber")
      .populate("generatedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("patient", "fullName icNumber dateOfBirth address")
      .populate("generatedBy", "fullName");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};