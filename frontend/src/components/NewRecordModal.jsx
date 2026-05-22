import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import MedicalRecordFields from "./MedicalRecordFields";

const EMPTY_FORM = {
  doctor: "",
  diagnosis: "",
  notes: "",
  allergies: [],
};

const NewRecordModal = ({ patientId, onCreated }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [allergyInput, setAllergyInput] = useState("");
  const [saving, setSaving] = useState(false);
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

  const reset = () => {
    setForm(EMPTY_FORM);
    setAllergyInput("");
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

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

  const handleSubmit = async () => {
    if (!form.doctor) {
      toast.error("Please assign a doctor");
      return;
    }
    setSaving(true);
    try {
      // Step 1: create the medical record (no prescription yet)
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
        <p className="text-sm opacity-60 mb-4">
          Prescription medications can be added after the record is created.
        </p>

        <MedicalRecordFields
          form={form}
          onChange={handleChange}
          doctors={doctors}
          allergyInput={allergyInput}
          onAllergyInputChange={setAllergyInput}
          onAddAllergy={handleAddAllergy}
          onRemoveAllergy={handleRemoveAllergy}
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
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : null}
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