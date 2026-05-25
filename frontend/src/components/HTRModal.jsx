import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";

const EMPTY_RECORD = { diagnosis: "", notes: "", allergies: [], doctor: "" };
const EMPTY_PATIENT = {
  fullName: "", NRIC: "", dateOfBirth: "", race: "", sex: "", address: "", contactNumber: "",
};

const Field = ({ label, children }) => (
  <div className="form-control w-full">
    <label className="label py-1">
      <span className="label-text text-xs font-medium">{label}</span>
    </label>
    {children}
  </div>
);

const HTRModal = ({ onPatientCreated }) => {
  const [step, setStep] = useState("upload"); // upload | extracting | review | saving
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [patient, setPatient] = useState(EMPTY_PATIENT);
  const [record, setRecord] = useState(EMPTY_RECORD);
  const [allergyInput, setAllergyInput] = useState("");
  const fileInputRef = useRef(null);
  const [doctors, setDoctors] = useState([]);

    useEffect(() => {
    const fetchDoctors = async () => {
        try {
        const res = await api.get("/users/doctors");
        setDoctors(res.data);
        } catch {
        console.error("Failed to fetch doctors");
        }
    };
    fetchDoctors();
    }, []);

  const handleFiles = (selected) => {
    const arr = Array.from(selected);
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleExtract = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    setStep("extracting");

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));

      const res = await api.post("/htr/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPatient({ ...EMPTY_PATIENT, ...res.data.patient });
      setRecord({ ...EMPTY_RECORD, ...res.data.record });
      setStep("review");
    } catch (err) {
      toast.error("Failed to extract data. Please try again.");
      console.log(err)
      setStep("upload");
    }
  };

  const handleConfirm = async () => {
  if (!patient.fullName || !patient.NRIC) {
    toast.error("Full name and NRIC are required");
    return;
  }
  if ((record.diagnosis || record.notes || record.allergies.length > 0) && !record.doctor) {
    toast.error("Please assign a doctor to the medical record");
    return;
  }
  setStep("saving");

  try {
    const patientRes = await api.post("/patients", patient);
    const newPatient = patientRes.data;

    if (record.diagnosis || record.notes || record.allergies.length > 0) {
      await api.post(`/patients/${newPatient._id}/records`, {
        diagnosis: record.diagnosis,
        notes: record.notes,
        allergies: record.allergies,
        doctor: record.doctor,
      });
    }

    toast.success("Patient and record created successfully");
    onPatientCreated(newPatient);
    handleClose();
  } catch (err) {
    const msg = err.response?.data?.message || "";
    if (msg.includes("NRIC")) toast.error("NRIC already exists");
    else toast.error("Failed to save patient");
    setStep("review");
  }
};

  const handleClose = () => {
    setStep("upload");
    setFiles([]);
    setPreviews([]);
    setPatient(EMPTY_PATIENT);
    setRecord(EMPTY_RECORD);
    setAllergyInput("");
    document.getElementById("htr_modal")?.close();
  };

  const addAllergy = () => {
    const val = allergyInput.trim();
    if (!val) return;
    setRecord((r) => ({ ...r, allergies: [...r.allergies, val] }));
    setAllergyInput("");
  };

  const removeAllergy = (i) =>
    setRecord((r) => ({ ...r, allergies: r.allergies.filter((_, idx) => idx !== i) }));

  return (
    <dialog id="htr_modal" className="modal">
      <div className="modal-box max-w-3xl w-full max-h-[90vh] overflow-y-auto">

        {/* STEP: UPLOAD */}
        {step === "upload" && (
          <>
            <h3 className="font-bold text-lg mb-2">Upload Medical Record Photos</h3>
            <p className="text-sm opacity-60 mb-6">
              Upload one or more photos of the patient's handwritten medical record. Gemini AI will extract the data for you to review.
            </p>

            {/* Drop zone */}
            <div
              className="border-2 border-dashed border-base-300 rounded-xl p-10 text-center cursor-pointer hover:border-primary transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-4xl mb-3">📷</div>
              <p className="font-medium">Drop images here or click to browse</p>
              <p className="text-xs opacity-50 mt-1">JPG, PNG, WEBP · Max 10MB each · Up to 10 pages</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt={`Page ${i + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border border-base-300" />
                    <span className="absolute top-1 left-1 badge badge-neutral badge-xs">
                      {i + 1}
                    </span>
                    <button
                      className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newFiles = files.filter((_, idx) => idx !== i);
                        const newPreviews = previews.filter((_, idx) => idx !== i);
                        setFiles(newFiles);
                        setPreviews(newPreviews);
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleExtract}
                disabled={files.length === 0}
              >
                Extract Data →
              </button>
            </div>
          </>
        )}

        {/* STEP: EXTRACTING */}
        {step === "extracting" && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="font-medium">Reading handwritten records...</p>
            <p className="text-sm opacity-50">This may take a few seconds</p>
          </div>
        )}

        {/* STEP: REVIEW */}
        {step === "review" && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">Review Extracted Data</h3>
              <span className="badge badge-success badge-sm">AI Extracted</span>
            </div>
            <p className="text-sm opacity-60 mb-6">
              Review and correct any errors before saving. All fields are editable.
            </p>

            <div className="divider text-xs">Patient Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Full Name">
                <input className="input input-bordered input-sm w-full"
                  value={patient.fullName}
                  onChange={e => setPatient(p => ({ ...p, fullName: e.target.value }))} />
              </Field>
              <Field label="NRIC">
                <input className="input input-bordered input-sm w-full"
                  value={patient.NRIC}
                  onChange={e => setPatient(p => ({ ...p, NRIC: e.target.value }))} />
              </Field>
              <Field label="Date of Birth">
                <input type="date" className="input input-bordered input-sm w-full"
                  value={patient.dateOfBirth}
                  onChange={e => setPatient(p => ({ ...p, dateOfBirth: e.target.value }))} />
              </Field>
              <Field label="Race">
                <input className="input input-bordered input-sm w-full"
                  value={patient.race}
                  onChange={e => setPatient(p => ({ ...p, race: e.target.value }))} />
              </Field>
              <Field label="Sex">
                <select className="select select-bordered select-sm w-full"
                  value={patient.sex}
                  onChange={e => setPatient(p => ({ ...p, sex: e.target.value }))}>
                  <option value="">— Select —</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Contact Number">
                <input className="input input-bordered input-sm w-full"
                  value={patient.contactNumber}
                  onChange={e => setPatient(p => ({ ...p, contactNumber: e.target.value }))} />
              </Field>
            </div>
            <Field label="Address">
              <input className="input input-bordered input-sm w-full"
                value={patient.address}
                onChange={e => setPatient(p => ({ ...p, address: e.target.value }))} />
            </Field>

            <div className="divider text-xs mt-4">Medical Record</div>
            <Field label="Attending Doctor *">
                <select
                    className="select select-bordered select-sm w-full"
                    value={record.doctor}
                    onChange={e => setRecord(r => ({ ...r, doctor: e.target.value }))}
                >
                    <option value="">— Select doctor —</option>
                    {doctors.map((d) => (
                    <option key={d._id} value={d._id}>{d.fullName}</option>
                    ))}
                </select>
            </Field>
            <Field label="Diagnosis">
              <input className="input input-bordered input-sm w-full"
                value={record.diagnosis}
                onChange={e => setRecord(r => ({ ...r, diagnosis: e.target.value }))} />
            </Field>
            <Field label="Notes (includes medications prescribed if any)">
              <textarea className="textarea textarea-bordered textarea-sm w-full" rows={5}
                value={record.notes}
                onChange={e => setRecord(r => ({ ...r, notes: e.target.value }))} />
            </Field>
            <Field label="Allergies">
              <div className="flex gap-2">
                <input className="input input-bordered input-sm flex-1"
                  placeholder="Add allergy..."
                  value={allergyInput}
                  onChange={e => setAllergyInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addAllergy()} />
                <button className="btn btn-sm btn-outline" onClick={addAllergy}>Add</button>
              </div>
              {record.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {record.allergies.map((a, i) => (
                    <span key={i} className="badge badge-error gap-1">
                      {a}
                      <button onClick={() => removeAllergy(i)}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setStep("upload")}>← Re-upload</button>
              <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                Confirm & Save
              </button>
            </div>
          </>
        )}

        {/* STEP: SAVING */}
        {step === "saving" && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="font-medium">Creating patient record...</p>
          </div>
        )}

      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleClose}>close</button>
      </form>
    </dialog>
  );
};

export default HTRModal;