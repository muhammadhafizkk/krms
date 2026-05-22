import { XIcon } from "lucide-react";

/**
 * MedicalRecordFields
 *
 * Pure fields component for creating/editing a MedicalRecord.
 * Prescription is NOT included here — it is managed separately
 * via the PrescriptionPanel in RecordDetail after the record exists.
 *
 * Props:
 *   form     — { doctor, diagnosis, notes, allergies }
 *   onChange — (field, value) => void
 *   doctors  — [{ _id, fullName, medicalLicenseNumber }]
 *   allergyInput        — string
 *   onAllergyInputChange — (value) => void
 *   onAddAllergy         — () => void
 *   onRemoveAllergy      — (index) => void
 */
const MedicalRecordFields = ({
  form,
  onChange,
  doctors,
  allergyInput,
  onAllergyInputChange,
  onAddAllergy,
  onRemoveAllergy,
}) => {
  return (
    <div className="flex flex-col gap-4">

      {/* Doctor */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
          Assign Doctor
        </label>
        <select
          className="select select-bordered w-full"
          value={form.doctor}
          onChange={(e) => onChange("doctor", e.target.value)}
        >
          <option value="">— Select a doctor —</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.fullName}
              {doc.medicalLicenseNumber ? ` · ${doc.medicalLicenseNumber}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Diagnosis */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
          Diagnosis
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={2}
          value={form.diagnosis}
          onChange={(e) => onChange("diagnosis", e.target.value)}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
          Notes
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          rows={3}
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
        />
      </div>

      {/* Allergies */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-2 block">
          Allergies
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.allergies.map((a, i) => (
            <span key={i} className="badge badge-warning badge-outline gap-1">
              {a}
              <button
                onClick={() => onRemoveAllergy(i)}
                className="ml-1 opacity-60 hover:opacity-100"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="input input-sm input-bordered flex-1"
            placeholder="Add allergy..."
            value={allergyInput}
            onChange={(e) => onAllergyInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddAllergy()}
          />
          <button className="btn btn-sm btn-outline" onClick={onAddAllergy}>
            Add
          </button>
        </div>
      </div>

    </div>
  );
};

export default MedicalRecordFields;