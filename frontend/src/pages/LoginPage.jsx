import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import api from '../lib/axios'
import { Link } from 'react-router'

const LoginPage = ({ setUser }) => {
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [loading,setLoading] = useState(false)

    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()

        if(!email || !password){
            toast.error("All fields are required")
            return
        }

        setLoading(true)
        try {
            const res = await api.post("/users/login", {
                email,
                password
            })
            localStorage.setItem("token", res.data.token)
            console.log(res.data)
            setUser(res.data)
            toast.success("Log in successfully")
            navigate("/")
        } catch (error) {
            console.log("Error logging in", error)
            toast.error("Failed to log in")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='card bg-base-100'>
                <div className='card-body'>
                    <h2 className='card-title text-2xl mb-4'>Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className='form-control mb-4 w-full'>
                            <label className='label'>
                                <span className='label-text'>Email</span>
                            </label>
                            <input 
                                type='email' 
                                placeholder='Email' 
                                className='input input-bordered w-full' 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>

                        <div className='form-control mb-4 w-full'>
                            <label className='label'>
                                <span className='label-text'>Password</span>
                            </label>
                            <input 
                                type='password' 
                                placeholder='Password' 
                                className='input input-bordered w-full' 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>

                        <div className='card-actions justify-end'>
                            <p className='text-sm pt-2'>
                                Don't have an account?{" "}
                                <Link to="/register" className='link link-primary'>
                                    Register
                                </Link>
                            </p>
                            <button type="submit" className='btn btn-primary' disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </div>
                    </form>
                </div>
                
            </div>
        </div>
  )
}

export default LoginPage