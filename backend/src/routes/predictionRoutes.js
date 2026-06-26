import express from "express";
import { protect } from "../middleware/auth.js";

const FLASK_URL = process.env.FLASK_URL || "http://localhost:5002";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const response = await fetch(`${FLASK_URL}/predict`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({ message: "Prediction service unavailable" });
  }
});

router.post("/retrain", async (req, res) => {
  try {
    const response = await fetch(`${FLASK_URL}/retrain`, { method: "POST" });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({ message: "Prediction service unavailable" });
  }
});

export default router;