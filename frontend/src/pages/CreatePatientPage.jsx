import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import api from "../lib/axios";
import HTRModal from "../components/HTRModal";

const CreatePatientPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    NRIC: "",
    dateOfBirth: "",
    race: "",
    sex: "",
    address: "",
    contactNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const extractDOB = (nric) => {
    if (nric.length < 6) return "";

    const year = parseInt(nric.substring(0, 2));
    const month = nric.substring(2, 4);
    const day = nric.substring(4, 6);

    const fullYear = year > 30 ? 1900 + year : 2000 + year;

    return `${fullYear}-${month}-${day}`; // HTML date input format
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "NRIC") {
      const dob = extractDOB(value);
      setFormData({
        ...formData,
        NRIC: value,
        dateOfBirth: dob,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.NRIC ||
      !formData.dateOfBirth ||
      !formData.race ||
      !formData.sex ||
      !formData.address ||
      !formData.contactNumber
    ) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/patients", formData);
      toast.success("Created successfully");
      navigate("/patients");
    } catch (error) {
      console.log("Error creating patient", error);

      if (error.response?.data?.message?.includes("NRIC")) {
        toast.error("NRIC already exists");
      } else {
        toast.error("Failed to create patient");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card bg-base-100">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Add Patient</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4 w-full">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="input input-bordered w-full"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-control mb-4 w-full">
              <label className="label">
                <span className="label-text">NRIC</span>
              </label>
              <input
                type="text"
                name="NRIC"
                placeholder="NRIC"
                className="input input-bordered w-full"
                value={formData.NRIC}
                onChange={handleChange}
              />
            </div>

            <div className="form-control mb-4 w-full">
              <label className="label">
                <span className="label-text">Race</span>
              </label>
              <input
                type="text"
                name="race"
                placeholder="Race"
                className="input input-bordered w-full"
                value={formData.race}
                onChange={handleChange}
              />
            </div>

            <div className="form-control mb-4 w-full">
              <label className="label">
                <span className="label-text">Sex</span>
              </label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    value="Male"
                    className="radio radio-primary"
                    checked={formData.sex === "Male"}
                    onChange={handleChange}
                  />
                  <span className="label-text">M</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    value="Female"
                    className="radio radio-primary"
                    checked={formData.sex === "Female"}
                    onChange={handleChange}
                  />
                  <span className="label-text">F</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sex"
                    value="Other"
                    className="radio radio-primary"
                    checked={formData.sex === "Other"}
                    onChange={handleChange}
                  />
                  <span className="label-text">Other</span>
                </label>
              </div>
            </div>

            <div className="form-control mb-4 w-full">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="input input-bordered w-full"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-control mb-4 w-full">
              <label className="label">
                <span className="label-text">Contact Number</span>
              </label>
              <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                className="input input-bordered w-full"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>

            <div className="card-actions justify-between">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Patient"}
              </button>
            </div>
           </form>

          {/* HTR divider */}
          <div className="divider text-xs opacity-50 my-6">OR</div>
          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={() => document.getElementById("htr_modal").showModal()}
          >
            📷 Upload Existing Medical Record Photo
          </button>
        </div>
      </div>

      <HTRModal onPatientCreated={(newPatient) => navigate(`/patients/${newPatient._id}`)} />
    </div>
  );
};

export default CreatePatientPage;
