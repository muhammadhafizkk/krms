import User from "../models/User.js";
import jwt from "jsonwebtoken"

export async function registerUser(req,res){
    const {
        username,
        password,
        role,
        fullName,
        email,
        contactNumber,
        medicalLicenseNumber,
        signature
    } = req.body;

  const userData = {
    username,
    password,
    role,
    fullName,
    email,
    contactNumber
  };

  if (role === "Doctor") {
    userData.medicalLicenseNumber = medicalLicenseNumber;
    userData.signature = signature;
  }

    try {
        if (!username || !password || !role || !fullName || !email || !contactNumber) {
            return res.status(400).json({message: "Please fill all the fields"})
        }

        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({message: "This email has already been used"})
        }
        const usernameTaken = await User.findOne({ username });
        if (usernameTaken) {
            return res.status(400).json({ message: "Username is already taken" });
        }

        const user = await User.create(userData)
        const token = generateToken(user._id)
        res.status(201).json({
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            email: user.email,
            token,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"})
    }
}

export async function loginUser(req,res){
    const { email, password } = req.body

    try {
        if (!password || !email) {
            return res.status(400).json({message: "Please fill all the fields"})
        }

        const user = await User.findOne({email})

        if(!user || !(await user.matchPassword(password))) {
            return res.status(401).json({message: "Invalid credentials"})
        }
        const token = generateToken(user._id)
        res.status(200).json({
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            email: user.email,
            token,
        })

    } catch (error) {
        res.status(500).json({message: "Server error"})
    }
}

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}