import { useEffect, useState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import PatientsNotFound from "../components/PatientsNotFound";
import CheckInModal from "../components/CheckInModal";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router";

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Change this number to control page capacity

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/patients");
        setPatients(res.data);
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
  }, []);

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
      setCurrentPage(1); // Reset to page 1 when user modifies search query
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, patients]);

  // --- PAGINATION COMPUTATION ---
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // This chunked array contains only the entries for the visible view frame
  const currentPagePatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

  const openCheckInModal = (patient) => {
    setSelectedPatient(patient);
    document.getElementById("checkin_modal").showModal();
  };

  const handleCheckedIn = () => {};

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
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
                + Add Patient
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center text-primary py-10">
            Loading patients...
          </div>
        )}

        {!loading && patients.length > 0 && filteredPatients.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <table className="table">
                <thead>
                  <tr>
                    {/* Changed # to represent actual row count across pages */}
                    <th>#</th>
                    <th>NRIC</th>
                    <th>Full Name</th>
                    <th>Contact No.</th>
                    <th className="text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map over chopped currentPagePatients instead of full array */}
                  {currentPagePatients.map((patient, index) => (
                    <tr key={patient._id}>
                      <th>{indexOfFirstItem + index + 1}</th>
                      <td>{patient.NRIC}</td>
                      <td>{patient.fullName}</td>
                      <td>{patient.contactNumber}</td>
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
                                View
                              </Link>
                            </li>
                            <li>
                              <button
                                className="btn btn-ghost"
                                onClick={() => openCheckInModal(patient)}
                              >
                                Check In
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- DAISYUI PAGINATION ELEMENT --- */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="join border border-base-300">
                  <button 
                    className="join-item btn btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    « Prev
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`join-item btn btn-sm ${currentPage === pageNumber ? 'btn-primary' : ''}`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button 
                    className="join-item btn btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next »
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && (patients.length === 0 || filteredPatients.length === 0) && <PatientsNotFound />}
      </div>

      <CheckInModal patient={selectedPatient} onCheckedIn={handleCheckedIn} />
    </div>
  );
};

export default PatientsPage;