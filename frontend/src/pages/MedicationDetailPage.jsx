import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { formatDate } from "../lib/utils";
import Detail from "../components/Detail";
import BackButton from "../components/BackButton";
import { PencilIcon, SaveIcon, XIcon, TrashIcon } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateInput = (isoDate) =>
  isoDate ? new Date(isoDate).toISOString().split("T")[0] : "";

// ─── Main Page ────────────────────────────────────────────────────────────────

const MedicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medication, setMedication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        const res = await api.get(`/medications/${id}`);
        setMedication(res.data);
      } catch (error) {
        console.error("Error fetching medication", error);
        toast.error("Failed to load medication");
      } finally {
        setLoading(false);
      }
    };
    fetchMedication();
  }, [id]);

  // Sync form whenever medication loads or is updated
  useEffect(() => {
    if (medication) {
      setForm({
        medicationName: medication.medicationName || "",
        batchNumber: medication.batchNumber || "",
        manufacturer: medication.manufacturer || "",
        supplier: medication.supplier || "",
        productionDate: toDateInput(medication.productionDate),
        expiryDate: toDateInput(medication.expiryDate),
        quantity: medication.quantity ?? "",
        unit: medication.unit || "",
        price: medication.price ?? "",
        dosage: medication.dosage || "",
        dispensingCategory: medication.dispensingCategory || "",
      });
    }
  }, [medication]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/medications/${id}`, form);
      toast.success("Medication updated");
      setMedication(res.data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating medication", error);
      if (error.response?.data?.message?.includes("Batch")) {
        toast.error("Batch number already exists");
      } else {
        toast.error("Failed to update medication");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      medicationName: medication.medicationName || "",
      batchNumber: medication.batchNumber || "",
      manufacturer: medication.manufacturer || "",
      supplier: medication.supplier || "",
      productionDate: toDateInput(medication.productionDate),
      expiryDate: toDateInput(medication.expiryDate),
      quantity: medication.quantity ?? "",
      unit: medication.unit || "",
      price: medication.price ?? "",
      dosage: medication.dosage || "",
      dispensingCategory: medication.dispensingCategory || "",
    });
    setEditing(false);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/medications/${id}`);
      toast.success("Medication deleted");
      document.getElementById("delete_medication_modal").close();
      navigate("/medications");
    } catch (error) {
      console.error("Error deleting medication", error);
      toast.error("Failed to delete medication");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!medication) return <div className="text-center py-10">Medication not found</div>;

  // Check if expiry date has passed
  const isExpired = new Date(medication.expiryDate) < new Date();

  return (
    <div className="min-h-screen flex flex-col items-center p-6 gap-6">
      <BackButton />

      <div className="card bg-base-100 shadow-xl w-full max-w-4xl">
        <div className="card-body">

          {/* Card header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="card-title text-2xl">
                {editing ? form.medicationName || "Medication Details" : medication.medicationName}
              </h2>
              {!editing && (
                <span className={`badge badge-outline ${medication.dispensingCategory === "OTC" ? "badge-success" : "badge-warning"}`}>
                  {medication.dispensingCategory}
                </span>
              )}
              {isExpired && !editing && (
                <span className="badge badge-error badge-outline">Expired</span>
              )}
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
                    onClick={() =>
                      document.getElementById("delete_medication_modal").showModal()
                    }
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

          <div className="divider my-0" />

          {/* Fields */}
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Medication Name
                </label>
                <input
                  type="text"
                  name="medicationName"
                  className="input input-bordered w-full"
                  value={form.medicationName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Batch Number
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  className="input input-bordered w-full"
                  value={form.batchNumber}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  className="input input-bordered w-full"
                  value={form.manufacturer}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  className="input input-bordered w-full"
                  value={form.supplier}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Production Date
                </label>
                <input
                  type="date"
                  name="productionDate"
                  className="input input-bordered w-full"
                  value={form.productionDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  className="input input-bordered w-full"
                  value={form.expiryDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  className="input input-bordered w-full"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Unit
                </label>
                <input
                  type="text"
                  name="unit"
                  placeholder="tablet / bottle / ml"
                  className="input input-bordered w-full"
                  value={form.unit}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  className="input input-bordered w-full"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Dosage
                </label>
                <input
                  type="text"
                  name="dosage"
                  placeholder="500mg"
                  className="input input-bordered w-full"
                  value={form.dosage}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
                  Dispensing Category
                </label>
                <select
                  name="dispensingCategory"
                  className="select select-bordered w-full"
                  value={form.dispensingCategory}
                  onChange={handleChange}
                >
                  <option value="">— Select category —</option>
                  <option value="OTC">OTC (Over the Counter)</option>
                  <option value="Prescription">Prescription Only</option>
                </select>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <Detail label="Medication Name" value={medication.medicationName} />
              <Detail label="Batch Number" value={medication.batchNumber} />
              <Detail label="Manufacturer" value={medication.manufacturer} />
              <Detail label="Supplier" value={medication.supplier} />
              <Detail
                label="Production Date"
                value={formatDate(new Date(medication.productionDate))}
              />
              <Detail
                label="Expiry Date"
                value={formatDate(new Date(medication.expiryDate))}
              />
              <Detail label="Quantity" value={`${medication.quantity} ${medication.unit}`} />
              <Detail label="Dosage" value={medication.dosage} />
              <Detail label="Price" value={`$${medication.price.toFixed(2)}`} />
              <Detail label="Dispensing Category" value={medication.dispensingCategory === "OTC" ? "OTC (Over the Counter)" : "Prescription Only"} />
              <Detail
                label="Last Updated"
                value={formatDate(new Date(medication.updatedAt))}
              />
            </div>
          )}

        </div>
      </div>

      {/* Delete confirmation modal */}
      <dialog id="delete_medication_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Medication</h3>
          <p className="py-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{medication.medicationName}</span>{" "}
            (Batch: {medication.batchNumber})? This cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() =>
                document.getElementById("delete_medication_modal").close()
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
              Delete Medication
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default MedicationDetailPage;