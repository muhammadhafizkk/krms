import { useState } from "react";
import { ClipboardPlusIcon } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const CheckInModal = ({ patient, onCheckedIn }) => {
  const [purpose, setPurpose] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => setPurpose("");

  const handleSubmit = async () => {
    if (!purpose.trim()) {
      toast.error("Please enter the purpose of visit");
      return;
    }

    setSaving(true);
    try {
      const res = await api.post("/visits/checkin", {
        patientId: patient._id,
        purpose: purpose.trim(),
      });
      toast.success(`${patient.fullName} checked in`);
      onCheckedIn(res.data);
      reset();
      document.getElementById("checkin_modal").close();
    } catch (error) {
      console.error("Error checking in patient", error);
      toast.error(error.response?.data?.message || "Failed to check in patient");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog id="checkin_modal" className="modal">
      <div className="modal-box max-w-md">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardPlusIcon className="size-5" />
          <h3 className="font-bold text-lg">Check In Patient</h3>
        </div>

        {patient && (
          <p className="text-sm opacity-60 mb-4">
            {patient.fullName} · {patient.NRIC}
          </p>
        )}

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-1 block">
            Purpose of Visit
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            rows={3}
            placeholder="e.g. General consultation, follow-up, medication refill..."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={() => {
              reset();
              document.getElementById("checkin_modal").close();
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
              <ClipboardPlusIcon className="size-4" />
            )}
            Check In
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={reset}>close</button>
      </form>
    </dialog>
  );
};

export default CheckInModal;