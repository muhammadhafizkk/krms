import express from "express";
import {
  generateDocument,
  getAllDocuments,
  getDocumentById,
} from "../controllers/documentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getAllDocuments);
router.get("/:id", getDocumentById);
router.post("/generate", generateDocument);

export default router;