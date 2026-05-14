import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { formatDate } from "../lib/utils";
import { PencilIcon, TrashIcon, SaveIcon, XIcon } from "lucide-react";
import MedicalRecordFields from "./MedicalRecordFields";
import PrescriptionRow from "./PrescriptionRow";

const RecordDetail = ({ record, patientId, onUpdated, onDeleted }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [allergyInput, setAllergyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Fetch doctors once on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/users/doctors");
        setDoctors(res.data);
      } catch (error) {
        console.error("Failed to fetch doctors", error);
      }
    };
    fetchDoctors();
  }, []);

  // Sync form state whenever the selected record changes
  useEffect(() => {
    if (record) {
      setForm({
        doctor: record.doctor?._id || record.doctor || "",
        diagnosis: record.diagnosis || "",
        notes: record.notes || "",
        allergies: [...(record.allergies || [])],
        prescription: (record.prescription || []).map((p) => ({ ...p })),
      });
      setEditing(false);
      setAllergyInput("");
    }
  }, [record]);

  if (!record || !form) return null;

  // Single onChange handler for flat fields
  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // Allergy handlers
  const handleAddAllergy = () => {
    const val = allergyInput.trim();
    if (!val) return;
    setForm((f) => ({ ...f, allergies: [...f.allergies, val] }));
    setAllergyInput("");
  };
  const handleRemoveAllergy = (i) =>
    setForm((f) => ({ ...f, allergies: f.allergies.filter((_, idx) => idx !== i) }));

  // Prescription handlers
  const handleAddPrescription = () =>
    setForm((f) => ({
      ...f,
      prescription: [...f.prescription, { medication: "", dosage: "", instructions: "" }],
    }));
  const handleUpdatePrescription = (i, key, val) =>
    setForm((f) => {
      const updated = [...f.prescription];
      updated[i] = { ...updated[i], [key]: val };
      return { ...f, prescription: updated };
    });
  const handleRemovePrescription = (i) =>
    setForm((f) => ({ ...f, prescription: f.prescription.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/patients/${patientId}/records/${record._id}`, form);
      toast.success("Record updated");
      onUpdated(res.data);
      setEditing(false);
    } catch (error) {
      console.error("Error in handleSave", error);
      toast.error("Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this medical record? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/patients/${patientId}/records/${record._id}`);
      toast.success("Record deleted");
      onDeleted(record._id);
    } catch (error) {
      console.error("Error in handleDelete", error);
      toast.error("Failed to delete record");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setForm({
      doctor: record.doctor?._id || record.doctor || "",
      diagnosis: record.diagnosis || "",
      notes: record.notes || "",
      allergies: [...(record.allergies || [])],
      prescription: (record.prescription || []).map((p) => ({ ...p })),
    });
    setAllergyInput("");
    setEditing(false);
  };

  const assignedDoctor = doctors.find(
    (d) => d._id === (record.doctor?._id || record.doctor)
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Header: date, doctor name, action buttons */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs opacity-50 uppercase tracking-wide">
            {formatDate(new Date(record.createdAt))}
          </p>
          <p className="text-sm opacity-60">
            Doctor:{" "}
            {assignedDoctor?.fullName || record.doctor?.fullName || "Unassigned"}
          </p>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setEditing(true)}
              >
                <PencilIcon className="size-4" /> Edit
              </button>
              <button
                className="btn btn-sm btn-error btn-outline"
                onClick={handleDelete}
                disabled={deleting}
              >
                <TrashIcon className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <SaveIcon className="size-4" />
                )}
                Save
              </button>
              <button className="btn btn-sm btn-ghost" onClick={handleCancel}>
                <XIcon className="size-4" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="divider my-0" />

      {/* Edit mode: use shared MedicalRecordFields */}
      {editing ? (
        <MedicalRecordFields
          form={form}
          onChange={handleChange}
          doctors={doctors}
          allergyInput={allergyInput}
          onAllergyInputChange={setAllergyInput}
          onAddAllergy={handleAddAllergy}
          onRemoveAllergy={handleRemoveAllergy}
          onAddPrescription={handleAddPrescription}
          onUpdatePrescription={handleUpdatePrescription}
          onRemovePrescription={handleRemovePrescription}
        />
      ) : (
        /* Read mode: static display */
        <div className="flex flex-col gap-4">

          {/* Diagnosis */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1">
              Diagnosis
            </p>
            <p className="text-sm">
              {record.diagnosis || <span className="opacity-40">—</span>}
            </p>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1">
              Notes
            </p>
            <p className="text-sm">
              {record.notes || <span className="opacity-40">—</span>}
            </p>
          </div>

          {/* Allergies */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-2">
              Allergies
            </p>
            <div className="flex flex-wrap gap-2">
              {record.allergies?.length > 0 ? (
                record.allergies.map((a, i) => (
                  <span key={i} className="badge badge-warning badge-outline">
                    {a}
                  </span>
                ))
              ) : (
                <span className="opacity-40 text-sm">None recorded</span>
              )}
            </div>
          </div>

          {/* Prescription */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-2">
              Prescription
            </p>
            <div className="flex flex-col gap-2">
              {record.prescription?.length > 0 ? (
                record.prescription.map((item, i) => (
                  <PrescriptionRow key={i} item={item} />
                ))
              ) : (
                <span className="opacity-40 text-sm">None prescribed</span>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default RecordDetail;