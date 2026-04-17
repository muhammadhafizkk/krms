import { UserRoundX } from 'lucide-react'
import React from 'react'
import { Link } from "react-router"

const PatientsNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
        <div className='bg-primary/10 rounded-full p-8'>
            <UserRoundX className='size-10 text-primary'/>
        </div>
        <h3 className='text-2xl font-bold'>No patients yet</h3>
        <Link to="/patients/create" className='btn btn-primary'>
            Add a patient
        </Link>
    </div>
  )
}

export default PatientsNotFound