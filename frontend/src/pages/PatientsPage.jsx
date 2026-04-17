import React, { useEffect, useState } from 'react'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import PatientsNotFound from '../components/PatientsNotFound'
import { ChevronRightIcon } from 'lucide-react'
import { Link } from 'react-router'

const PatientsPage = () => {
  const [patients,setPatients] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/patients")
        console.log(res.data)
        setPatients(res.data)
      } catch (error) {
        console.log("Error fetching patients")
        if(error.response.status === 429){
          toast.error("Too many requests")
        } else {
          toast.error("Failed to load patients")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  return (
    <div className='min-h-screen'>
      <Navbar />
      <div className='max-w-7xl mx-auto p-4 mt-6'>
        {loading && <div className='text-center text-primary py-10'>Loading patients...</div>}

        {patients.length === 0 && <PatientsNotFound />}

        {patients.length > 0 && (
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>NRIC</th>
                  <th>Full Name</th>
                  <th>Contact No.</th>
                  <th></th>
                </tr>
              </thead>
              {patients.map(patient => (
              <tbody>
                <tr>
                  <th>1</th>
                  <td>{patient.NRIC}</td>
                  <td>{patient.fullName}</td>
                  <td>{patient.contactNumber}</td>
                  <td><div className='dropdown dropdown-end'>
                    <div tabIndex={0} role="button" className='btn m-1'><ChevronRightIcon className='size-5'/></div>
                    <ul tabIndex="-1" className='dropdown-content menu bg-base-100 rounded-box z-1 w-24 p-2 shadow-sm'>
                    <li><Link to={`/patients/${patient._id}`} className='btn btn-ghost'><span>View</span></Link></li>
                    </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
              ))}
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientsPage