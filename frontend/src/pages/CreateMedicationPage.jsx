import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import api from "../lib/axios";

const CreateMedicationPage = () => {
  const [formData, setFormData] = useState({
    medicationName: "",
    batchNumber: "",
    manufacturer: "",
    productionDate: "",
    expiryDate: "",
    quantity: "",
    unit: "",
    price: "",
    supplier: "",
    dosage: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.medicationName ||
      !formData.batchNumber ||
      !formData.manufacturer ||
      !formData.productionDate ||
      !formData.expiryDate ||
      !formData.quantity ||
      !formData.unit ||
      !formData.price ||
      !formData.supplier ||
      !formData.dosage
    ) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      await api.post("/medications", formData);

      toast.success("Medication created successfully");

      navigate("/medications");
    } catch (error) {
      console.log("Error creating medication", error);

      if (error.response?.data?.message?.includes("Batch")) {
        toast.error("Batch number already exists");
      } else {
        toast.error("Failed to create medication");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card bg-base-100 w-full max-w-2xl shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            Add Medication
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Medication Name
                  </span>
                </label>
                <input
                  type="text"
                  name="medicationName"
                  placeholder="Medication Name"
                  className="input input-bordered w-full"
                  value={formData.medicationName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Batch Number
                  </span>
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  placeholder="Batch Number"
                  className="input input-bordered w-full"
                  value={formData.batchNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Manufacturer
                  </span>
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  placeholder="Manufacturer"
                  className="input input-bordered w-full"
                  value={formData.manufacturer}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Supplier
                  </span>
                </label>
                <input
                  type="text"
                  name="supplier"
                  placeholder="Supplier"
                  className="input input-bordered w-full"
                  value={formData.supplier}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Production Date
                  </span>
                </label>
                <input
                  type="date"
                  name="productionDate"
                  className="input input-bordered w-full"
                  value={formData.productionDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Expiry Date
                  </span>
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  className="input input-bordered w-full"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Quantity
                  </span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  className="input input-bordered w-full"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Unit
                  </span>
                </label>
                <input
                  type="text"
                  name="unit"
                  placeholder="tablet / bottle / ml"
                  className="input input-bordered w-full"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Price
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  placeholder="Price"
                  className="input input-bordered w-full"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">
                    Dosage
                  </span>
                </label>
                <input
                  type="text"
                  name="dosage"
                  placeholder="500mg"
                  className="input input-bordered w-full"
                  value={formData.dosage}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Medication"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMedicationPage;