import express from "express"
import { protect } from "../middleware/auth.js"
import { registerUser,loginUser } from "../controllers/authControllers.js"

const router = express.Router();

router.post("/register", registerUser)
router.post("/login", loginUser)

router.get("/me", protect, async (req,res) => {
    res.status(200).json(req.user)
})

export default router