import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { formatDate } from "../lib/utils";
import { PencilIcon, TrashIcon, SaveIcon, XIcon, PlusIcon, FlaskConicalIcon, CheckCircleIcon } from "lucide-react";
import MedicalRecordFields from "./MedicalRecordFields";
import PrescriptionInput from "./PrescriptionInput";
import PrescriptionRow from "./PrescriptionRow";

// ─── Prescription Panel ───────────────────────────────────────────────────────
// Handles create / edit / dispense for the prescription linked to this record.

const PrescriptionPanel = ({ record, patientId, onPrescriptionChange }) => {
  const prescription = record.prescription;

  const [medications, setMedications] = useState([]);
  const [editingRx, setEditingRx] = useState(false);
  const [rxItems, setRxItems] = useState([]);
  const [savingRx, setSavingRx] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [deletingRx, setDeletingRx] = useState(false);

  // Fetch prescription-only medications for the dropdown
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await api.get("/medications");
        const rxOnly = res.data.filter(
          (m) => m.dispensingCategory === "Prescription"
        );
        setMedications(rxOnly);
      } catch (error) {
        console.error("Failed to fetch medications", error);
      }
    };
    fetchMedications();
  }, []);

  // Sync local items when prescription changes
  useEffect(() => {
    if (prescription?.items) {
      setRxItems(
        prescription.items.map((item) => ({
          medication: item.medication?._id || item.medication,
          quantity: item.quantity,
          dosage: item.dosage,
          instructions: item.instructions || "",
        }))
      );
    } else {
      setRxItems([]);
    }
    setEditingRx(false);
  }, [prescription]);

  const addItem = () =>
    setRxItems((prev) => [
      ...prev,
      { medication: "", quantity: "", dosage: "", instructions: "" },
    ]);

  const updateItem = (i, key, val) =>
    setRxItems((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [key]: val };
      return updated;
    });

  const removeItem = (i) =>
    setRxItems((prev) => prev.filter((_, idx) => idx !== i));

  // Create a new prescription for this record
  const handleCreateRx = async () => {
    if (rxItems.length === 0) {
      toast.error("Add at least one medication");
      return;
    }
    const incomplete = rxItems.some((item) => !item.medication || !item.quantity || !item.dosage);
    if (incomplete) {
      toast.error("Fill in medication, quantity and dosage for all items");
      return;
    }
    setSavingRx(true);
    try {
      const res = await api.post("/prescriptions", {
        medicalRecord: record._id,
        patient: patientId,
        doctor: record.doctor?._id || record.doctor,
        items: rxItems,
      });
      toast.success("Prescription created");
      onPrescriptionChange({ ...record, prescription: res.data });
      setEditingRx(false);
    } catch (error) {
      console.error("Error creating prescription", error);
      toast.error(error.response?.data?.message || "Failed to create prescription");
    } finally {
      setSavingRx(false);
    }
  };

  // Update existing prescription items
  const handleUpdateRx = async () => {
    if (rxItems.length === 0) {
      toast.error("Add at least one medication");
      return;
    }
    const incomplete = rxItems.some((item) => !item.medication || !item.quantity || !item.dosage);
    if (incomplete) {
      toast.error("Fill in medication, quantity and dosage for all items");
      return;
    }
    setSavingRx(true);
    try {
      const res = await api.put(`/prescriptions/${prescription._id}`, {
        items: rxItems,
      });
      toast.success("Prescription updated");
      onPrescriptionChange({ ...record, prescription: res.data });
      setEditingRx(false);
    } catch (error) {
      console.error("Error updating prescription", error);
      toast.error(error.response?.data?.message || "Failed to update prescription");
    } finally {
      setSavingRx(false);
    }
  };

  // Dispense — deducts stock
  const handleDispense = async () => {
    if (!window.confirm("Dispense this prescription? This will deduct stock and cannot be undone.")) return;
    setDispensing(true);
    try {
      const res = await api.put(`/prescriptions/${prescription._id}/dispense`);
      toast.success("Prescription dispensed");
      onPrescriptionChange({ ...record, prescription: res.data });
    } catch (error) {
      console.error("Error dispensing prescription", error);
      toast.error(error.response?.data?.message || "Failed to dispense prescription");
    } finally {
      setDispensing(false);
    }
  };

  // Delete prescription
  const handleDeleteRx = async () => {
    if (!window.confirm("Delete this prescription?")) return;
    setDeletingRx(true);
    try {
      await api.delete(`/prescriptions/${prescription._id}`);
      toast.success("Prescription deleted");
      onPrescriptionChange({ ...record, prescription: null });
    } catch (error) {
      console.error("Error deleting prescription", error);
      toast.error(error.response?.data?.message || "Failed to delete prescription");
    } finally {
      setDeletingRx(false);
    }
  };

  // ── No prescription yet ──
  if (!prescription) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-50">
            Prescription
          </p>
          {!editingRx && (
            <button
              className="btn btn-xs btn-outline"
              onClick={() => { setEditingRx(true); setRxItems([{ medication: "", quantity: "", dosage: "", instructions: "" }]); }}
            >
              <PlusIcon className="size-3" /> Add Prescription
            </button>
          )}
        </div>

        {editingRx ? (
          <div className="flex flex-col gap-2">
            {rxItems.map((item, i) => (
              <PrescriptionInput
                key={i}
                item={item}
                index={i}
                medications={medications}
                onChange={updateItem}
                onRemove={removeItem}
              />
            ))}
            <button className="btn btn-xs btn-outline w-fit" onClick={addItem}>
              <PlusIcon className="size-3" /> Add Item
            </button>
            <div className="flex gap-2 mt-1">
              <button
                className="btn btn-sm btn-primary"
                onClick={handleCreateRx}
                disabled={savingRx}
              >
                {savingRx ? <span className="loading loading-spinner loading-xs" /> : <SaveIcon className="size-4" />}
                Save Prescription
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditingRx(false)}>
                <XIcon className="size-4" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm opacity-40">No prescription for this visit</p>
        )}
      </div>
    );
  }

  // ── Prescription exists ──
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-50">
            Prescription
          </p>
          {prescription.dispensed ? (
            <span className="badge badge-success badge-sm gap-1">
              <CheckCircleIcon className="size-3" /> Dispensed
            </span>
          ) : (
            <span className="badge badge-warning badge-sm">Pending</span>
          )}
        </div>

        {/* Actions — only available before dispensing */}
        {!prescription.dispensed && (
          <div className="flex gap-2">
            {!editingRx ? (
              <>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => setEditingRx(true)}
                >
                  <PencilIcon className="size-3" /> Edit
                </button>
                <button
                  className="btn btn-xs btn-success btn-outline"
                  onClick={handleDispense}
                  disabled={dispensing}
                >
                  {dispensing
                    ? <span className="loading loading-spinner loading-xs" />
                    : <FlaskConicalIcon className="size-3" />}
                  Dispense
                </button>
                <button
                  className="btn btn-xs btn-error btn-outline"
                  onClick={handleDeleteRx}
                  disabled={deletingRx}
                >
                  <TrashIcon className="size-3" />
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-xs btn-primary"
                  onClick={handleUpdateRx}
                  disabled={savingRx}
                >
                  {savingRx ? <span className="loading loading-spinner loading-xs" /> : <SaveIcon className="size-3" />}
                  Save
                </button>
                <button className="btn btn-xs btn-ghost" onClick={() => setEditingRx(false)}>
                  <XIcon className="size-3" /> Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {prescription.dispensed && (
        <p className="text-xs opacity-50 mb-2">
          Dispensed on {formatDate(new Date(prescription.dispensedAt))}
        </p>
      )}

      {editingRx ? (
        <div className="flex flex-col gap-2">
          {rxItems.map((item, i) => (
            <PrescriptionInput
              key={i}
              item={item}
              index={i}
              medications={medications}
              onChange={updateItem}
              onRemove={removeItem}
            />
          ))}
          <button className="btn btn-xs btn-outline w-fit" onClick={addItem}>
            <PlusIcon className="size-3" /> Add Item
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {prescription.items?.map((item, i) => (
            <PrescriptionRow key={i} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Record Detail ────────────────────────────────────────────────────────────

const RecordDetail = ({ record, patientId, onUpdated, onDeleted }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [allergyInput, setAllergyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [doctors, setDoctors] = useState([]);

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

  useEffect(() => {
    if (record) {
      setForm({
        doctor: record.doctor?._id || record.doctor || "",
        diagnosis: record.diagnosis || "",
        notes: record.notes || "",
        allergies: [...(record.allergies || [])],
      });
      setEditing(false);
      setAllergyInput("");
    }
  }, [record]);

  if (!record || !form) return null;

  const handleChange = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleAddAllergy = () => {
    const val = allergyInput.trim();
    if (!val) return;
    setForm((f) => ({ ...f, allergies: [...f.allergies, val] }));
    setAllergyInput("");
  };

  const handleRemoveAllergy = (i) =>
    setForm((f) => ({
      ...f,
      allergies: f.allergies.filter((_, idx) => idx !== i),
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(
        `/patients/${patientId}/records/${record._id}`,
        form
      );
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
    });
    setAllergyInput("");
    setEditing(false);
  };

  const assignedDoctor = doctors.find(
    (d) => d._id === (record.doctor?._id || record.doctor)
  );

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
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

      {/* Edit mode */}
      {editing ? (
        <MedicalRecordFields
          form={form}
          onChange={handleChange}
          doctors={doctors}
          allergyInput={allergyInput}
          onAllergyInputChange={setAllergyInput}
          onAddAllergy={handleAddAllergy}
          onRemoveAllergy={handleRemoveAllergy}
        />
      ) : (
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

          <div className="divider my-0" />

          {/* Prescription Panel */}
          <PrescriptionPanel
            record={record}
            patientId={patientId}
            onPrescriptionChange={onUpdated}
          />

        </div>
      )}
    </div>
  );
};

export default RecordDetail;