import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import { Link } from 'react-router'

const RegisterPage = ({ setUser }) => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "",
        fullName: "",
        email: "",
        contactNumber: ""
    })
    const [loading,setLoading] = useState(false)

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e) => {
        e.preventDefault()

        if(!formData.username || !formData.password || !formData.role || !formData.fullName || !formData.email || !formData.contactNumber){
            toast.error("All fields are required")
            return
        }

        setLoading(true)
        try {
            const res = await api.post("/users/register", formData)
            localStorage.setItem("token", res.data.token)
            console.log(res.data)
            setUser(res.data)
            toast.success("Registered successfully")
            navigate("/login")
        } catch (error) {
            console.log("Error registering", error)
            toast.error("Failed to register")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='card bg-base-100'>
                <div className='card-body'>
                    <h2 className='card-title text-2xl mb-4'>Register</h2>
                    <form onSubmit={handleRegister}>
                        <div className='form-control mb-4 w-full'>
                            <label className='label'>
                                <span className='label-text'>Username</span>
                            </label>
                            <input 
                                type='text' 
                                name='username'
                                placeholder='Username' 
                                className='input input-bordered w-full' 
                                value={formData.username} 
                                onChange={handleChange}
                            />
                        </div>

                        <div className='form-control mb-4 w-full'>
                            <label className='label'>
                                <span className='label-text'>Email</span>
                            </label>
                            <input 
                                type='email' 
                                name='email'
                                placeholder='Email' 
                                className='input input-bordered w-full' 
                                value={formData.email} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div className='form-control mb-4 w-full'>
                            <label className='label'>
                                <span className='label-text'>Role</span>
                            </label>
                            <div className='flex gap-6 mt-1'>
                                <label className='flex items-center gap-2 cursor-pointer'>
                                    <input
                                        type='radio'
                                        name='role'
                                        value='Doctor'
                                        className='radio radio-primary'
                                        checked={formData.role === "Doctor"}
                                        onChange={handleChange}
                                    />
                                    <span className='label-text'>Doctor</span>
                                </label>
                                <label className='flex items-center gap-2 cursor-pointer'>
                                    <input
                                        type='radio'
                                        name='role'
                                        value='ClinicAssistant'
                                        className='radio radio-primary'
                                        checked={formData.role === "ClinicAssistant"}
                                        onChange={handleChange}
                                    />
                                    <span className='label-text'>Clinic Assistant</span>
                                </label>
                            </div>
                        </div>

                        <div className='form-control mb-4 w-full'>
                            <label className='label'>
                                <span className='label-text'>Full Name</span>
                            </label>
                            <input 
                                type='text' 
                                name='fullName'
                                placeholder='Full Name' 
                                className='input input-bordered w-full' 
                                value={formData.fullName} 
                                onChange={handleChange}
                            />
                        </div>

                        <div className='form-control mb-4 w-full'>
                            <label className='label'>
                                <span className='label-text'>Contact Number</span>
                            </label>
                            <input 
                                type='text' 
                                name='contactNumber'
                                placeholder='Contact Number' 
                                className='input input-bordered w-full' 
                                value={formData.contactNumber} 
                                onChange={handleChange}
                            />
                        </div>

                        <div className='form-control mb-4 w-full'>
                            <label className='label'>
                                <span className='label-text'>Password</span>
                            </label>
                            <input 
                                type='password' 
                                name='password'
                                placeholder='Password' 
                                className='input input-bordered w-full' 
                                value={formData.password} 
                                onChange={handleChange} 
                            />
                        </div>

                        <div className='card-actions justify-between'>
                            <p className='text-sm pt-2'>
                                Already have an account?{" "}
                                <Link to="/login" className='link link-primary'>
                                    Login
                                </Link>
                            </p>
                            <button type="submit" className='btn btn-primary' disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </div>
                    </form>
                </div>
                
            </div>
        </div>
  )
}

export default RegisterPage