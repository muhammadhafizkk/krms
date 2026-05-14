import { UserRoundX } from 'lucide-react'
import React from 'react'
import { Link } from "react-router"

const MedicationsNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6 max-w-md mx-auto text-center">
        <div className='bg-primary/10 rounded-full p-8'>
            <UserRoundX className='size-10 text-primary'/>
        </div>
        <h3 className='text-2xl font-bold'>No medications yet</h3>
        <Link to="/medications/create" className='btn btn-primary'>
            Add a medication
        </Link>
    </div>
  )
}

export default MedicationsNotFound