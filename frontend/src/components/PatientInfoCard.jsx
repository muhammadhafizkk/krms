import React, { useEffect, useState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { formatDate } from "../lib/utils";
import Detail from "../components/Detail";
import { PencilIcon, SaveIcon, XIcon, TrashIcon } from "lucide-react";

const PatientInfoCard = ({ patient, onUpdated, onDeleted }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(null);
 
  // Sync form when patient data loads
  useEffect(() => {
    if (patient) {
      setForm({
        fullName: patient.fullName || "",
        NRIC: patient.NRIC || "",
        dateOfBirth: patient.dateOfBirth
          ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
          : "",
        race: patient.race || "",
        sex: patient.sex || "",
        address: patient.address || "",
        contactNumber: patient.contactNumber || "",
      });
    }
  }, [patient]);
 
  if (!form) return null;
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
 
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/patients/${patient._id}`, form);
      toast.success("Patient updated");
      onUpdated(res.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating patient", error);
      if (error.response?.data?.message?.includes("NRIC")) {
        toast.error("NRIC already exists");
      } else {
        toast.error("Failed to update patient");
      }
    } finally {
      setSaving(false);
    }
  };
 
  const handleCancel = () => {
    setForm({
      fullName: patient.fullName || "",
      NRIC: patient.NRIC || "",
      dateOfBirth: patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
        : "",
      race: patient.race || "",
      sex: patient.sex || "",
      address: patient.address || "",
      contactNumber: patient.contactNumber || "",
    });
    setEditing(false);
  };
 
  const handleDelete = async () => {
    document.getElementById("delete_patient_modal").showModal();
  };
 
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/patients/${patient._id}`);
      toast.success("Patient deleted");
      document.getElementById("delete_patient_modal").close();
      onDeleted();
    } catch (error) {
      console.error("Error deleting patient", error);
      toast.error("Failed to delete patient");
    } finally {
      setDeleting(false);
    }
  };
 
  return (
    <>
      <div className="card bg-base-100 shadow-xl w-full max-w-6xl">
        <div className="card-body">
          {/* Card header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-2xl">Patient Details</h2>
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
                  >
                    <TrashIcon className="size-4" /> Delete
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
 
          <div className="flex flex-col md:flex-row gap-6">
            {/* LEFT — avatar + name */}
            <div className="flex flex-col items-center md:w-1/3 text-center">
              <div className="avatar placeholder">
                <div className="w-32 rounded-full bg-base-200 flex items-center justify-center text-4xl font-bold">
                  <span>{patient.fullName.charAt(0)}</span>
                </div>
              </div>
              <h2 className="text-xl font-semibold mt-4">
                {editing ? form.fullName || patient.fullName : patient.fullName}
              </h2>
            </div>
 
            <div className="divider md:divider-horizontal" />
 
            {/* RIGHT — fields */}
            {editing ? (
              <div className="flex-1 grid grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="input input-bordered w-full"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                </div>
 
                {/* NRIC */}
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                    NRIC
                  </label>
                  <input
                    type="text"
                    name="NRIC"
                    className="input input-bordered w-full"
                    value={form.NRIC}
                    onChange={handleChange}
                  />
                </div>
 
                {/* Date of Birth */}
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="input input-bordered w-full"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
 
                {/* Race */}
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                    Race
                  </label>
                  <input
                    type="text"
                    name="race"
                    className="input input-bordered w-full"
                    value={form.race}
                    onChange={handleChange}
                  />
                </div>
 
                {/* Sex */}
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                    Sex
                  </label>
                  <select
                    name="sex"
                    className="select select-bordered w-full"
                    value={form.sex}
                    onChange={handleChange}
                  >
                    <option value="">— Select —</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
 
                {/* Contact Number */}
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    className="input input-bordered w-full"
                    value={form.contactNumber}
                    onChange={handleChange}
                  />
                </div>
 
                {/* Address */}
                <div className="col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="input input-bordered w-full"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Detail label="NRIC" value={patient.NRIC} />
                <Detail
                  label="Date of Birth"
                  value={formatDate(new Date(patient.dateOfBirth))}
                />
                <Detail label="Race" value={patient.race} />
                <Detail label="Sex" value={patient.sex} />
                <Detail label="Contact Number" value={patient.contactNumber} />
                <Detail label="Address" value={patient.address} />
                <Detail
                  label="Created At"
                  value={formatDate(new Date(patient.createdAt))}
                />
                <Detail
                  label="Last Updated"
                  value={formatDate(new Date(patient.updatedAt))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Delete confirmation modal */}
      <dialog id="delete_patient_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Patient</h3>
          <p className="py-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{patient.fullName}</span>? This will
            permanently remove the patient and cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() =>
                document.getElementById("delete_patient_modal").close()
              }
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <TrashIcon className="size-4" />
              )}
              Delete Patient
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default PatientInfoCard;