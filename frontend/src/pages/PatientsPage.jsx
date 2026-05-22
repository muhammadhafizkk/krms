import { useEffect, useState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import PatientsNotFound from "../components/PatientsNotFound";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router";

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  //Fetch patient based on tab(all patients/checked in) useEffect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = activeTab === "all" ? "/patients" : "/visits/today";

        const res = await api.get(url);

        if (activeTab === "today") {
          // extract patient from visit
          const mapped = res.data.map((v) => ({
            ...v.patient,
            visitId: v._id,
            status: v.status,
          }));
          setPatients(mapped);
        } else {
          setPatients(res.data);
        }
      } catch (error) {
        console.log("Error fetching data");
        if (error.response?.status === 429) {
          toast.error("Too many requests");
        } else {
          toast.error("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Search patient useEffect
  useEffect(() => {
    const delay = setTimeout(() => {
      const term = searchTerm.toLowerCase();

      const filtered = patients.filter(
        (patient) =>
          patient.fullName.toLowerCase().includes(term) ||
          patient.NRIC.includes(term) ||
          patient.contactNumber.includes(term)
      );

      setFilteredPatients(filtered);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, patients]);

  // ✅ Check-in handler
  const handleCheckIn = async (patientId) => {
    try {
      await api.post("/visits/checkin", {
        patientId,
        purpose: "General Consultation",
      });

      toast.success("Patient checked in");

      // 🔄 refresh if on today tab
      if (activeTab === "today") {
        setActiveTab("today"); // triggers refetch
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to check in patient");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="tabs tabs-boxed mb-4 bg-base-200 p-1 rounded-xl">
              <button
                className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Patients
              </button>
              <button
                className={`tab ${activeTab === "today" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("today")}
              >
                Checked In Today
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="input input-bordered flex items-center gap-2 w-full md:w-72">
                <SearchIcon className="size-4 opacity-60" />
                <input
                  type="search"
                  className="grow"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
              <Link
                to={"/patients/create"}
                className="btn btn-primary whitespace-nowrap"
              >
                <span>+ Add Patient</span>
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center text-primary py-10">
            Loading patients...
          </div>
        )}

        {!loading && (filteredPatients.length === 0) === 0 && (
          <PatientsNotFound />
        )}

        {!loading && patients.length > 0 && (
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>NRIC</th>
                  <th>Full Name</th>
                  <th>Contact No.</th>
                  {activeTab === "today" && <th>Status</th>}
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={patient._id}>
                    <th>{index + 1}</th>
                    <td>{patient.NRIC}</td>
                    <td>{patient.fullName}</td>
                    <td>{patient.contactNumber}</td>

                    {activeTab === "today" && <td>{patient.status}</td>}

                    {/* Dropdown actions */}
                    <td className="text-right">
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn m-1">
                          <ChevronRightIcon className="size-5" />
                        </div>
                        <ul
                          tabIndex={-1}
                          className="dropdown-content menu bg-base-100 rounded-box z-1 w-30 p-2 shadow-sm"
                        >
                          <li>
                            <Link
                              to={`/patients/${patient._id}`}
                              className="btn btn-ghost"
                            >
                              <span>View</span>
                            </Link>
                          </li>
                          {activeTab === "all" && (
                            <li>
                              <button
                                onClick={() => handleCheckIn(patient._id)}
                                className="btn btn-ghost"
                              >
                                Check In
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;
