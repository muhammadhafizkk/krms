import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import MedicalRecordFields from "./MedicalRecordFields";

const EMPTY_FORM = {
  doctor: "",
  diagnosis: "",
  notes: "",
  allergies: [],
  prescription: [],
};

const NewRecordModal = ({ patientId, onCreated }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [allergyInput, setAllergyInput] = useState("");
  const [saving, setSaving] = useState(false);
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

  const reset = () => {
    setForm(EMPTY_FORM);
    setAllergyInput("");
  };

  // Single onChange handler for flat fields (doctor, diagnosis, notes)
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

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await api.post(`/patients/${patientId}/records`, form);
      toast.success("Medical record created");
      onCreated(res.data);
      reset();
      document.getElementById("new_record_modal").close();
    } catch (error) {
      console.error("Error creating record", error);
      toast.error("Failed to create record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog id="new_record_modal" className="modal">
      <div className="modal-box max-w-2xl w-full">
        <h3 className="font-bold text-lg mb-4">New Medical Record</h3>

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

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={() => {
              reset();
              document.getElementById("new_record_modal").close();
            }}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-xs" /> : null}
            Create Record
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={reset}>close</button>
      </form>
    </dialog>
  );
};

export default NewRecordModal;