import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./config/db.js"
import patientRoutes from "./routes/patientRoutes.js"
import authRoutes from "./routes/authRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

//middleware
app.use(cors({
    origin: ["http://localhost:5173"]
}))
app.use(express.json())

//routes
app.use("/api/users", authRoutes)
app.use("/api/patients", patientRoutes)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT:" + PORT)
    })
})