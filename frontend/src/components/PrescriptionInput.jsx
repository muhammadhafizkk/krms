import { XIcon } from "lucide-react";

/**
 * PrescriptionInput
 * 
 * One row in the prescription items list.
 * Renders a medication dropdown (populated from parent),
 * a quantity input, a dosage input, and an instructions input.
 */
const PrescriptionInput = ({ item, index, medications, onChange, onRemove }) => {
  return (
    <div className="bg-base-200 rounded-lg p-3 flex flex-col gap-2 text-sm">
      <div className="flex gap-2">
        {/* Medication dropdown — only Prescription-category meds */}
        <select
          className="select select-sm select-bordered flex-1"
          value={item.medication}
          onChange={(e) => onChange(index, "medication", e.target.value)}
        >
          <option value="">— Select medication —</option>
          {medications.map((med) => (
            <option key={med._id} value={med._id}>
              {med.medicationName} · {med.dosage} ({med.quantity} {med.unit} left)
            </option>
          ))}
        </select>

        {/* Quantity */}
        <input
          type="number"
          min="1"
          className="input input-sm input-bordered w-24"
          placeholder="Qty"
          value={item.quantity}
          onChange={(e) => onChange(index, "quantity", e.target.value)}
        />

        <button
          className="btn btn-sm btn-ghost text-error"
          onClick={() => onRemove(index)}
        >
          <XIcon className="size-4" />
        </button>
      </div>

      {/* Dosage and instructions */}
      <div className="flex gap-2">
        <input
          className="input input-sm input-bordered w-32"
          placeholder="Dosage"
          value={item.dosage}
          onChange={(e) => onChange(index, "dosage", e.target.value)}
        />
        <input
          className="input input-sm input-bordered flex-1"
          placeholder="Instructions (optional)"
          value={item.instructions}
          onChange={(e) => onChange(index, "instructions", e.target.value)}
        />
      </div>
    </div>
  );
};

export default PrescriptionInput;