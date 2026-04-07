require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

//create app
const app = express()

//middleware
app.use(cors())
app.use(express.json())

//database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('✅ MongoDB Connected, let\'s go!')
    } catch (err) {
        console.error('❌ Database connection failed:', err.message)
        process.exit(1)
    }
}

connectDB()

// 2. SCHEMA & MODEL (The "Blueprint")
const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    status: { type: String, default: 'Stable' }
}, { timestamps: true })

const Patient = mongoose.model('Patient', patientSchema)

//routes
app.get('/' , (req, res) => {
    res.send('Hello from Express bro!')
})

app.get('/api/patients', async (req, res) => {
    try {
        const patients = await Patient.find() // Gets everything from Atlas
        res.json(patients)
    } catch (err) {
        res.status(500).json({ message: "Server Error" })
    }
})

// Quick route to add a patient for testing
app.post('/api/patients', async (req, res) => {
    try {
        const newPatient = new Patient(req.body)
        const savedPatient = await newPatient.save()
        res.status(201).json(savedPatient)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

app.listen(process.env.PORT, () => {
    console.log(`The server is running on port ${process.env.PORT} dawg`)
})