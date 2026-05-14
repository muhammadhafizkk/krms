import express from "express"
import { protect } from "../middleware/auth.js"
import { registerUser,loginUser } from "../controllers/authControllers.js"
import User from "../models/User.js"

const router = express.Router();

router.post("/register", registerUser)
router.post("/login", loginUser)

router.get("/me", protect, async (req,res) => {
    res.status(200).json(req.user)
})

router.get("/doctors", async (req, res) => {
    try {
        const doctors = await User.find({ role: "Doctor" }).select("_id fullName email medicalLicenseNumber")
        res.status(200).json(doctors)
    } catch (error) {
        console.error("Error fetching doctors", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

export default router