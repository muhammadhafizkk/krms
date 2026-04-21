import { XIcon } from "lucide-react"

const PrescriptionInput = ({ item, index, onChange, onRemove }) => {
  return (
    <div className='bg-base-200 rounded-lg p-3 flex flex-col gap-2 text-sm'>
        <div className='flex gap-2'>
            <input 
                className='input input-sm input-bordered flex-1'
                placeholder='Medication'
                value={item.medication}
                onChange={(e) => onChange(index, "medication", e.target.value)}
            />
            <input 
                className='input input-sm input-bordered w-28'
                placeholder='Dosage'
                value={item.dosage}
                onChange={(e) => onChange(index, "dosage", e.target.value)}
            />
            <button className='btn btn-sm btn-ghost text-error' onClick={() => onRemove(index)}>
                <XIcon className='size-4' />
            </button>
        </div>
        <input 
            className='input input-sm input-bordered w-full'
            placeholder='Instructions (optional)'
            value={item.instructions}
            onChange={(e) => onChange(index, "instructions", e.target.value)}
        />  
    </div>
  )
}

export default PrescriptionInput