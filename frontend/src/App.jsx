import { useEffect, useState } from 'react'
import { Navigate, Route,Routes } from 'react-router'
import api from './lib/axios'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PatientsPage from './pages/PatientsPage'
import CreatePatientPage from './pages/CreatePatientPage'
import PatientDetailPage from './pages/PatientDetailPage'
import MedicationPage from './pages/MedicationPage'
import CreateMedicationPage from './pages/CreateMedicationPage'
import MedicationDetailPage from './pages/MedicationDetailPage'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get('/users/me')
          setUser(res.data)
        } catch (error) {
          console.log("Error fetching user", error)
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  if (loading) return <div>Loading...</div>;
  
  return (
    <div data-theme="emerald" className='min-h-screen bg-linear-to-b from-white to-base-200'>
      <Navbar user={user} setUser={setUser} />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage setUser={setUser}/>} />
          <Route path="/register" element={user ? <Navigate to="/" /> :<RegisterPage setUser={setUser}/>} />
          
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute user={user}><DashboardPage /></ProtectedRoute>} />

            {/* Patient routes */}
          <Route path='/patients' element={<ProtectedRoute user={user}><PatientsPage /></ProtectedRoute>} />
          <Route path="/patients/create" element={<ProtectedRoute user={user}><CreatePatientPage /></ProtectedRoute>} />
          <Route path="/patients/:id" element={<ProtectedRoute user={user}><PatientDetailPage /></ProtectedRoute>} />

            {/* Medication routes */}
          <Route path='/medications' element={<ProtectedRoute user={user}><MedicationPage user={user} /></ProtectedRoute>} />
          <Route path="/medications/create" element={<ProtectedRoute user={user}><CreateMedicationPage /></ProtectedRoute>} />
          <Route path="/medications/:id" element={<ProtectedRoute user={user}><MedicationDetailPage /></ProtectedRoute>} />
        </Routes>
    </div>
  )
}

export default App