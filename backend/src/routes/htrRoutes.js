import express from "express";
import multer from "multer";
import { extractFromImages } from "../controllers/htrController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Store in memory — no disk writes needed, we just pass to Gemini
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

router.post("/extract", protect, upload.array("images", 10), extractFromImages);

export default router;