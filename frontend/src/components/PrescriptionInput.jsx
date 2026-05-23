import { XIcon } from "lucide-react";

/**
 * PrescriptionInput
 *
 * One row in the prescription items editor.
 * Shows all medications regardless of dispensingCategory.
 * Dosage is already set per medication — no separate input needed.
 */
const PrescriptionInput = ({ item, index, medications, onChange, onRemove }) => {
  return (
    <div className="bg-base-200 rounded-lg p-3 flex items-center gap-2 text-sm">
      {/* Medication dropdown — all medications */}
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
  );
};

export default PrescriptionInput;