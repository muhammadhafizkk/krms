import React, { useState, useEffect } from 'react';
import api from "../lib/axios";
import toast from "react-hot-toast";
import MedicationsNotFound from "../components/MedicationsNotFound";
import WalkInSaleModal from "../components/WalkInSaleModal";
import { ChevronRightIcon, SearchIcon, ShoppingCartIcon } from "lucide-react";
import { Link } from "react-router";

const MedicationPage = ({ user }) => {
  const [medications, setMedications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/medications");
        setMedications(res.data);
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
      const filtered = medications.filter(
        (medication) =>
          medication.medicationName.toLowerCase().includes(term) ||
          medication.batchNumber.toLowerCase().includes(term)
      );
      setFilteredMedications(filtered);
      setCurrentPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, medications]);

  // --- PAGINATION CALCULATIONS ---
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageMedications = filteredMedications.slice(indexOfFirstItem, indexOfLastItem);

  const handleSaleCreated = (sale) => {
    setMedications((prev) =>
      prev.map((med) => {
        const soldItem = sale.items.find(
          (item) => (item.medication?._id || item.medication) === med._id
        );
        if (soldItem) {
          return { ...med, quantity: med.quantity - soldItem.quantity };
        }
        return med;
      })
    );
  };

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
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>

              <button
                className="btn btn-outline btn-secondary whitespace-nowrap"
                onClick={() =>
                  document.getElementById("walkin_sale_modal").showModal()
                }
              >
                <ShoppingCartIcon className="size-4" /> Walk-in Sale
              </button>

              <Link
                to={"/medications/create"}
                className="btn btn-primary whitespace-nowrap"
              >
                + Add Medication
              </Link>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center text-primary py-10">
            Loading medications...
          </div>
        )}

        {!loading && medications.length > 0 && filteredMedications.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medication Name</th>
                    <th>Batch Number</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th className="text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageMedications.map((medication, index) => (
                    <tr key={medication._id}>
                      <th>{indexOfFirstItem + index + 1}</th>
                      <td>{medication.medicationName}</td>
                      <td className="opacity-60">{medication.batchNumber}</td>
                      <td>
                        <span
                          className={`badge badge-sm badge-outline ${
                            medication.dispensingCategory === "OTC"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {medication.dispensingCategory || "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            medication.quantity === 0
                              ? "text-error font-semibold"
                              : medication.quantity <= 10
                              ? "text-warning font-semibold"
                              : ""
                          }
                        >
                          {medication.quantity} {medication.unit}
                        </span>
                      </td>
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
                                to={`/medications/${medication._id}`}
                                className="btn btn-ghost"
                              >
                                View
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
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

        {!loading && (medications.length === 0 || filteredMedications.length === 0) && <MedicationsNotFound />}
      </div>

      <WalkInSaleModal user={user} onSaleCreated={handleSaleCreated} />
    </div>
  );
};

export default MedicationPage;