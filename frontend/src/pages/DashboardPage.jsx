import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { formatDate } from "../lib/utils";
import {
  FlaskConicalIcon,
  PackageXIcon,
  CalendarClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  UsersRoundIcon,
  ClockIcon,
  RefreshCwIcon,
} from "lucide-react";

const POLL_INTERVAL = 20000;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });

const STATUS_CONFIG = {
  "Checked In":  { badge: "badge-info",    row: "border-l-4 border-l-info" },
  "In Progress": { badge: "badge-warning", row: "border-l-4 border-l-warning" },
  Completed:     { badge: "badge-success", row: "border-l-4 border-l-success opacity-60" },
};

const STATUSES = ["Checked In", "In Progress", "Completed"];

const LastUpdated = ({ time }) => {
  if (!time) return null;
  return (
    <span className="flex items-center gap-1 text-xs opacity-30 ml-auto">
      <RefreshCwIcon className="size-3" />
      {formatTime(time)}
    </span>
  );
};

// ─── Today's Visits ───────────────────────────────────────────────────────────

const TodayVisitsSection = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await api.get("/visits/today");
      setVisits(res.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch today's visits", error);
      if (loading) toast.error("Failed to load today's visits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
    const interval = setInterval(fetchVisits, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchVisits]);

  const handleStatusChange = async (visitId, newStatus) => {
    setUpdatingId(visitId);
    try {
      const res = await api.put(`/visits/${visitId}`, { status: newStatus });
      setVisits((prev) => prev.map((v) => (v._id === visitId ? res.data : v)));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update visit status", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const active = visits.filter((v) => v.status !== "Completed");
  const completed = visits.filter((v) => v.status === "Completed");

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <UsersRoundIcon className="size-5 text-primary" />
        <h2 className="text-lg font-bold">Today's Check-ins</h2>
        {!loading && <span className="badge badge-primary">{visits.length}</span>}
        <LastUpdated time={lastUpdated} />
      </div>

      {loading && <div className="text-center py-6 opacity-50">Loading...</div>}

      {!loading && visits.length === 0 && (
        <div className="flex items-center gap-2 text-sm opacity-40 py-4">
          <ClockIcon className="size-4" /> No check-ins today
        </div>
      )}

      {!loading && visits.length > 0 && (
        <div className="overflow-x-auto rounded-box border border-base-content/5">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Purpose</th>
                <th>Check-in Time</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {active.map((visit, i) => (
                <tr key={visit._id} className={`${STATUS_CONFIG[visit.status]?.row} hover`}>
                  <th className="opacity-40">{i + 1}</th>
                  <td>
                    <div className="cursor-pointer hover:underline" onClick={() => navigate(`/patients/${visit.patient?._id}`)}>
                      <p className="font-semibold">{visit.patient?.fullName}</p>
                      <p className="text-xs opacity-50">{visit.patient?.NRIC}</p>
                    </div>
                  </td>
                  <td className="text-sm opacity-70">{visit.purpose || "—"}</td>
                  <td className="text-sm opacity-60">{formatTime(visit.checkInTime)}</td>
                  <td>
                    <span className={`badge badge-sm badge-outline ${STATUS_CONFIG[visit.status]?.badge}`}>
                      {visit.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {STATUSES.filter((s) => s !== visit.status).map((s) => (
                        <button key={s} className="btn btn-xs btn-ghost opacity-60 hover:opacity-100"
                          disabled={updatingId === visit._id}
                          onClick={() => handleStatusChange(visit._id, s)}>
                          {updatingId === visit._id ? <span className="loading loading-spinner loading-xs" /> : s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}

              {active.length > 0 && completed.length > 0 && (
                <tr>
                  <td colSpan={6} className="text-xs uppercase tracking-widest opacity-30 py-2 text-center bg-base-200">
                    Completed
                  </td>
                </tr>
              )}

              {completed.map((visit, i) => (
                <tr key={visit._id} className={`${STATUS_CONFIG[visit.status]?.row} hover`}>
                  <th className="opacity-30">{active.length + i + 1}</th>
                  <td>
                    <div className="cursor-pointer hover:underline" onClick={() => navigate(`/patients/${visit.patient?._id}`)}>
                      <p className="font-semibold opacity-50">{visit.patient?.fullName}</p>
                      <p className="text-xs opacity-30">{visit.patient?.NRIC}</p>
                    </div>
                  </td>
                  <td className="text-sm opacity-40">{visit.purpose || "—"}</td>
                  <td className="text-sm opacity-40">{formatTime(visit.checkInTime)}</td>
                  <td>
                    <span className={`badge badge-sm badge-outline ${STATUS_CONFIG[visit.status]?.badge}`}>
                      {visit.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {STATUSES.filter((s) => s !== visit.status).map((s) => (
                        <button key={s} className="btn btn-xs btn-ghost opacity-40 hover:opacity-80"
                          disabled={updatingId === visit._id}
                          onClick={() => handleStatusChange(visit._id, s)}>
                          {updatingId === visit._id ? <span className="loading loading-spinner loading-xs" /> : s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Dispense Modal ───────────────────────────────────────────────────────────

const DispenseModal = ({ prescription, onDispensed }) => {
  const [dispensing, setDispensing] = useState(false);
  if (!prescription) return null;

  const handleDispense = async () => {
    setDispensing(true);
    try {
      await api.put(`/prescriptions/${prescription._id}/dispense`);
      toast.success("Prescription dispensed and stock updated");
      onDispensed(prescription._id);
      document.getElementById("dispense_modal").close();
    } catch (error) {
      console.error("Error dispensing prescription", error);
      toast.error(error.response?.data?.message || "Failed to dispense prescription");
    } finally {
      setDispensing(false);
    }
  };

  return (
    <dialog id="dispense_modal" className="modal">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-1">Confirm Dispense</h3>
        <p className="text-sm opacity-60 mb-4">Dispensing will deduct stock and cannot be undone.</p>

        <div className="bg-base-200 rounded-lg p-4 mb-4">
          <p className="text-xs uppercase tracking-widest opacity-50 mb-1">Patient</p>
          <p className="font-semibold">{prescription.patient?.fullName}</p>
          <p className="text-sm opacity-60">NRIC: {prescription.patient?.NRIC}</p>
          {prescription.patient?.address && (
            <p className="text-sm opacity-60">{prescription.patient?.address}</p>
          )}
          <p className="text-xs opacity-40 mt-1">Prescribed by Dr. {prescription.doctor?.fullName}</p>
        </div>

        <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Medications to Dispense</p>
        <div className="flex flex-col gap-2 mb-4">
          {prescription.items?.map((item, i) => (
            <div key={i} className="bg-base-200 rounded-lg p-3 flex justify-between items-start text-sm">
              <div>
                <p className="font-semibold">{item.medication?.medicationName}</p>
                <p className="opacity-60">{item.medication?.dosage}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{item.quantity} {item.medication?.unit}</p>
                <p className="text-xs opacity-40">{item.medication?.quantity} in stock</p>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={() => document.getElementById("dispense_modal").close()}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={handleDispense} disabled={dispensing}>
            {dispensing ? <span className="loading loading-spinner loading-xs" /> : <FlaskConicalIcon className="size-4" />}
            Confirm Dispense
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop"><button>close</button></form>
    </dialog>
  );
};

// ─── Pending Dispense ─────────────────────────────────────────────────────────

const PendingDispenseSection = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPending = useCallback(async () => {
    try {
      const res = await api.get("/prescriptions?dispensed=false");
      setPrescriptions(res.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch pending prescriptions", error);
      if (loading) toast.error("Failed to load pending prescriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPending]);

  const handleDispensed = (id) => {
    setPrescriptions((prev) => prev.filter((p) => p._id !== id));
    setSelected(null);
  };

  const openModal = (prescription) => {
    setSelected(prescription);
    document.getElementById("dispense_modal").showModal();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FlaskConicalIcon className="size-5 text-warning" />
        <h2 className="text-lg font-bold">Pending Dispense</h2>
        {!loading && prescriptions.length > 0 && (
          <span className="badge badge-warning">{prescriptions.length}</span>
        )}
        <LastUpdated time={lastUpdated} />
      </div>

      {loading && <div className="text-center py-6 opacity-50">Loading...</div>}

      {!loading && prescriptions.length === 0 && (
        <div className="flex items-center gap-2 text-sm opacity-40 py-4">
          <CheckCircleIcon className="size-4" /> No pending prescriptions
        </div>
      )}

      {!loading && prescriptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {prescriptions.map((prescription) => (
            <div key={prescription._id} className="card bg-base-100 border border-warning/30 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{prescription.patient?.fullName}</p>
                    <p className="text-xs opacity-50">{prescription.patient?.NRIC}</p>
                  </div>
                  <span className="badge badge-warning badge-sm badge-outline">Pending</span>
                </div>
                <p className="text-xs opacity-50 mt-1">
                  Dr. {prescription.doctor?.fullName} · {formatDate(new Date(prescription.createdAt))}
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  {prescription.items?.slice(0, 3).map((item, i) => (
                    <p key={i} className="text-xs opacity-70">
                      · {item.medication?.medicationName} — {item.quantity} {item.medication?.unit}
                    </p>
                  ))}
                  {prescription.items?.length > 3 && (
                    <p className="text-xs opacity-40">+{prescription.items.length - 3} more</p>
                  )}
                </div>
                <button className="btn btn-sm btn-warning btn-outline mt-3 w-full" onClick={() => openModal(prescription)}>
                  <FlaskConicalIcon className="size-4" /> Dispense
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DispenseModal prescription={selected} onDispensed={handleDispensed} />
    </div>
  );
};

// ─── Medication Alerts ────────────────────────────────────────────────────────

const ALERT_CONFIG = {
  out_of_stock:   { label: "Out of Stock",   classes: "border-error/30 bg-error/5",   badge: "badge-error",   icon: <PackageXIcon className="size-4 text-error" /> },
  low_stock:      { label: "Low Stock",      classes: "border-warning/30 bg-warning/5", badge: "badge-warning", icon: <AlertTriangleIcon className="size-4 text-warning" /> },
  expired:        { label: "Expired",        classes: "border-error/30 bg-error/5",   badge: "badge-error",   icon: <CalendarClockIcon className="size-4 text-error" /> },
  expiring_soon:  { label: "Expiring Soon",  classes: "border-warning/30 bg-warning/5", badge: "badge-warning", icon: <CalendarClockIcon className="size-4 text-warning" /> },
};

const daysUntilExpiry = (expiryDate) =>
  Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

const MedicationAlertsSection = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get("/medications?alert=true");
      setAlerts(res.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch medication alerts", error);
      if (loading) toast.error("Failed to load medication alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangleIcon className="size-5 text-error" />
        <h2 className="text-lg font-bold">Medication Alerts</h2>
        {!loading && alerts.length > 0 && (
          <span className="badge badge-error">{alerts.length}</span>
        )}
        <LastUpdated time={lastUpdated} />
      </div>

      {loading && <div className="text-center py-6 opacity-50">Loading...</div>}

      {!loading && alerts.length === 0 && (
        <div className="flex items-center gap-2 text-sm opacity-40 py-4">
          <CheckCircleIcon className="size-4" /> No medication alerts
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {alerts.map((med) => {
            const primaryAlert =
              med.alerts.includes("out_of_stock") || med.alerts.includes("expired")
                ? med.alerts.find((a) => a === "out_of_stock" || a === "expired")
                : med.alerts[0];
            const config = ALERT_CONFIG[primaryAlert];
            const days = daysUntilExpiry(med.expiryDate);

            return (
              <div key={med._id}
                className={`card border shadow-sm hover:shadow-md transition-shadow cursor-pointer ${config.classes}`}
                onClick={() => navigate(`/medications/${med._id}`)}>
                <div className="card-body p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <p className="font-semibold">{med.medicationName}</p>
                    </div>
                    <ChevronRightIcon className="size-4 opacity-30" />
                  </div>
                  <p className="text-xs opacity-50">Batch: {med.batchNumber}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {med.alerts.map((alert) => (
                      <span key={alert} className={`badge badge-sm badge-outline ${ALERT_CONFIG[alert].badge}`}>
                        {ALERT_CONFIG[alert].label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-col gap-0.5">
                    {(med.alerts.includes("low_stock") || med.alerts.includes("out_of_stock")) && (
                      <p className="text-xs opacity-70">Stock: {med.quantity} {med.unit} remaining</p>
                    )}
                    {(med.alerts.includes("expiring_soon") || med.alerts.includes("expired")) && (
                      <p className="text-xs opacity-70">
                        {days < 0 ? `Expired ${Math.abs(days)} days ago`
                          : days === 0 ? "Expires today"
                          : `Expires in ${days} days (${formatDate(new Date(med.expiryDate))})`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const DashboardPage = ({ user }) => {
  const isDoctor = user?.role === "Doctor";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 mt-4 flex flex-col gap-8">

        <div>
          <h1 className="text-2xl font-bold">
            Good {getGreeting()}, {user?.fullName?.split(" ")[0] ?? "there"}
          </h1>
          <p className="opacity-50 text-sm mt-1">
            {new Date().toLocaleDateString("en-MY", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body"><TodayVisitsSection /></div>
        </section>

        {!isDoctor && (
          <section className="card bg-base-100 shadow-sm">
            <div className="card-body"><PendingDispenseSection /></div>
          </section>
        )}

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body"><MedicationAlertsSection /></div>
        </section>

      </div>
    </div>
  );
};

export default DashboardPage;