import { useEffect, useState } from "react";
import { PlusIcon, XIcon, ShoppingCartIcon } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const EMPTY_ITEM = { medication: "", quantity: "" };

const WalkInSaleModal = ({ user, onSaleCreated }) => {
  const [medications, setMedications] = useState([]);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);

  // Fetch OTC-only medications
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await api.get("/medications");
        setMedications(res.data.filter((m) => m.dispensingCategory === "OTC"));
      } catch (error) {
        console.error("Failed to fetch medications", error);
      }
    };
    fetchMedications();
  }, []);

  const reset = () => setItems([{ ...EMPTY_ITEM }]);

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const updateItem = (i, field, value) =>
    setItems((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });

  const removeItem = (i) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  // Resolve selected medication object for stock display
  const getMed = (id) => medications.find((m) => m._id === id);

  const handleSubmit = async () => {
    // Validate
    for (const item of items) {
      if (!item.medication) {
        toast.error("Select a medication for all rows");
        return;
      }
      if (!item.quantity || Number(item.quantity) < 1) {
        toast.error("Enter a valid quantity for all rows");
        return;
      }
      const med = getMed(item.medication);
      if (med && Number(item.quantity) > med.quantity) {
        toast.error(`Insufficient stock for ${med.medicationName}. Available: ${med.quantity} ${med.unit}`);
        return;
      }
    }

    // Prevent duplicate medication rows
    const ids = items.map((i) => i.medication);
    if (new Set(ids).size !== ids.length) {
      toast.error("Duplicate medications — combine them into one row");
      return;
    }

    setSaving(true);
    try {
      const res = await api.post("/walkin-sales", {
        items: items.map((i) => ({
          medication: i.medication,
          quantity: Number(i.quantity),
        })),
        processedBy: user._id,
      });
      toast.success("Sale recorded and stock updated");
      onSaleCreated(res.data);
      reset();
      document.getElementById("walkin_sale_modal").close();
    } catch (error) {
      console.error("Error creating sale", error);
      toast.error(error.response?.data?.message || "Failed to record sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog id="walkin_sale_modal" className="modal">
      <div className="modal-box max-w-xl w-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <ShoppingCartIcon className="size-5" />
          <h3 className="font-bold text-lg">Walk-in Sale</h3>
        </div>
        <p className="text-sm opacity-60 mb-4">
          Only OTC medications are available for walk-in purchase.
        </p>

        {/* Items */}
        <div className="flex flex-col gap-3">
          {items.map((item, i) => {
            const med = getMed(item.medication);
            return (
              <div key={i} className="bg-base-200 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  {/* Medication dropdown */}
                  <select
                    className="select select-sm select-bordered flex-1"
                    value={item.medication}
                    onChange={(e) => updateItem(i, "medication", e.target.value)}
                  >
                    <option value="">— Select medication —</option>
                    {medications.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.medicationName} · {m.dosage}
                      </option>
                    ))}
                  </select>

                  {/* Quantity */}
                  <input
                    type="number"
                    min="1"
                    max={med?.quantity || undefined}
                    className="input input-sm input-bordered w-24"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", e.target.value)}
                  />

                  {/* Remove row */}
                  {items.length > 1 && (
                    <button
                      className="btn btn-sm btn-ghost text-error"
                      onClick={() => removeItem(i)}
                    >
                      <XIcon className="size-4" />
                    </button>
                  )}
                </div>

                {/* Stock info */}
                {med && (
                  <p className="text-xs opacity-50 pl-1">
                    {med.quantity} {med.unit} in stock · ${med.price.toFixed(2)} per {med.unit}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Add row */}
        <button className="btn btn-sm btn-outline mt-3" onClick={addItem}>
          <PlusIcon className="size-4" /> Add Item
        </button>

        {/* Actions */}
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={() => {
              reset();
              document.getElementById("walkin_sale_modal").close();
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
            ) : (
              <ShoppingCartIcon className="size-4" />
            )}
            Record Sale
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={reset}>close</button>
      </form>
    </dialog>
  );
};

export default WalkInSaleModal;