import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./config/db.js"
import patientRoutes from "./routes/patientRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import visitRoutes from "./routes/visitRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js"
import medicationRoutes from "./routes/medicationRoutes.js"
import prescriptionRoutes from "./routes/prescriptionRoutes.js"
import walkInSaleRoutes from "./routes/walkInSaleRoutes.js"
import documentRoutes from "./routes/documentRoutes.js"
import htrRoutes from "./routes/htrRoutes.js"
import predictionRoutes from "./routes/predictionRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

//middleware
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
    origin: allowedOrigins
}))
app.use(express.json())

//routes
app.use("/api/users", authRoutes)
app.use("/api/patients", patientRoutes)
app.use("/api/visits", visitRoutes)
app.use("/api/patients/:patientId/records", medicalRecordRoutes)
app.use("/api/medications", medicationRoutes)
app.use("/api/prescriptions", prescriptionRoutes)
app.use("/api/walkin-sales", walkInSaleRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/htr", htrRoutes)
app.use("/api/predictions", predictionRoutes)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server started on PORT:" + PORT)
    })
})