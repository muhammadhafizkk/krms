import React, { useEffect, useState } from 'react'
import { Route,Router,Routes } from 'react-router'
import axios from 'axios'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PatientsPage from './pages/PatientsPage'
import CreatePatientPage from './pages/CreatePatientPage'
import PatientDetailPage from './pages/PatientDetailPage'
import Navbar from './components/Navbar'
//import toast from "react-hot-toast"

const App = () => {
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get('/api/users/me', {
            headers: {Authorization: `Bearer ${token}`}
          })
          setUser(res.data)
        } catch (error) {
          setError("Failed to fetch user data")
          localStorage.removeItem("token")
        }
      }
    }
    fetchUser()
  }, [])

  
  return (
    <div data-theme="emerald" className='min-h-screen bg-linear-to-b from-white to-base-200'>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage setUser={setUser}/>} />
          <Route path="/register" element={<RegisterPage setUser={setUser}/>} />

          <Route path='/patients' element={<PatientsPage />} />
          <Route path="/patients/create" element={<CreatePatientPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
        </Routes>
    </div>
  )
}

export default App