import mongoose from "mongoose"
import bcrypt from "bcryptjs"

//1. Create schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Doctor", "ClinicAssistant"], required: true },
    fullName: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    medicalLicenseNumber: { type: String },
    signature: { type: String },
  },
  { timestamps: true }
);

//Better to hash in user module because it ensures the password is hashed consistenly or securely
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

//2. Create model based on schema
const User = mongoose.model("User", userSchema);

export default User
