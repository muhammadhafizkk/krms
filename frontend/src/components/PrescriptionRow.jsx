import React from 'react'

const PrescriptionRow = ({item}) => {
  return (
    <div className='bg-base-200 rounded-lg p-3 text-sm'>
        <div className='font-semibold'>{item.medication}</div>
        <div className='opacity-70'>{item.dosage}</div>
        {item.instructions && <div className='opacity-50 italic'>{item.instructions}</div>}
    </div>
  )
}

export default PrescriptionRow