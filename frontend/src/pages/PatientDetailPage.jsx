import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { formatDate } from "../lib/utils";
import PatientInfoCard from "../components/PatientInfoCard";
import RecordDetail from "../components/RecordDetail";
import NewRecordModal from "../components/NewRecordModal";
import DocumentModal from "../components/documents/DocumentModal";
import { PlusIcon } from "lucide-react"
import BackButton from "../components/BackButton";

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
 
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/patients/${id}`);
        setPatient(res.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load patient");
      } finally {
        setLoadingPatient(false);
      }
    };
    fetchPatient();
  }, [id]);
 
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get(`/patients/${id}/records`);
        setRecords(res.data);
        if (res.data.length > 0) setSelectedRecord(res.data[0]);
      } catch {
        toast.error("Failed to load medical records");
      } finally {
        setRecordsLoading(false);
      }
    };
    fetchRecords();
  }, [id]);
 
  const handlePatientUpdated = (updated) => setPatient(updated);
  const handlePatientDeleted = () => navigate("/patients");
 
  const handleRecordCreated = (newRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    setSelectedRecord(newRecord);
  };
  const handleRecordUpdated = (updated) => {
    setRecords((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    setSelectedRecord(updated);
  };
  const handleRecordDeleted = (deletedId) => {
    const remaining = records.filter((r) => r._id !== deletedId);
    setRecords(remaining);
    setSelectedRecord(remaining[0] || null);
  };
 
  if (loadingPatient) return <div className="text-center py-10">Loading...</div>;
  if (!patient) return <div className="text-center py-10">Patient not found</div>;
 
  return (
    <div className="min-h-screen flex flex-col items-center p-6 gap-6">
      <div className="flex items-center justify-between w-full max-w-6xl">
        <BackButton />
        <button
          className="btn btn-outline"
          onClick={() => document.getElementById("doc_modal").showModal()}
        >
          📄 Documents
        </button>
      </div>
 
      <PatientInfoCard
        patient={patient}
        onUpdated={handlePatientUpdated}
        onDeleted={handlePatientDeleted}
      />
 
      {/* Medical Records Card */}
      <div className="card bg-base-100 shadow-xl w-full max-w-6xl">
        <div className="card-body">
          <h2 className="card-title mb-4 text-2xl">Medical Records</h2>
          {recordsLoading ? (
            <div className="text-center py-6 opacity-50">Loading records...</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* LEFT — record list */}
              <div className="flex flex-col gap-2 md:w-1/3">
                <ul className="menu bg-base-200 rounded-box w-full p-1 gap-1">
                  {records.length === 0 && (
                    <li className="p-4 text-sm opacity-50 text-center">
                      No records yet
                    </li>
                  )}
                  {records.map((rec, i) => (
                    <li key={rec._id}>
                      <button
                        className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedRecord?._id === rec._id
                            ? "bg-primary text-primary-content"
                            : "hover:bg-base-300"
                        }`}
                        onClick={() => setSelectedRecord(rec)}
                      >
                        <span className="tabular-nums text-xs opacity-50 w-5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">
                            {formatDate(new Date(rec.createdAt))}
                          </span>
                          {rec.diagnosis && (
                            <span className="text-xs opacity-60 truncate max-w-40">
                              {rec.diagnosis}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  className="btn btn-primary btn-outline w-full"
                  onClick={() =>
                    document.getElementById("new_record_modal").showModal()
                  }
                >
                  <PlusIcon className="size-4" /> New Record
                </button>
              </div>
 
              <div className="divider md:divider-horizontal" />
 
              {/* RIGHT — record detail */}
              <div className="flex-1">
                {selectedRecord ? (
                  <RecordDetail
                    key={selectedRecord._id}
                    record={selectedRecord}
                    patientId={id}
                    onUpdated={handleRecordUpdated}
                    onDeleted={handleRecordDeleted}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-40 gap-2 py-10">
                    <p className="text-sm">No record selected</p>
                    <p className="text-xs">Create a new record to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
 
      <NewRecordModal patientId={id} onCreated={handleRecordCreated} />
      <DocumentModal modalId="doc_modal" patient={patient} />
    </div>
  );
};
 
export default PatientDetailPage;