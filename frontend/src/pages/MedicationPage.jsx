import React from 'react'
import { useState,useEffect } from 'react';
import api from "../lib/axios";
import toast from "react-hot-toast";
import MedicationsNotFound from "../components/MedicationsNotFound";
import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router";

const MedicationPage = () => {
    const [medications, setMedications] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredMedications, setFilteredMedications] = useState([]);
    const [loading, setLoading] = useState(true);

    //Fetch patient based on tab(all patients/checked in) useEffect
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
    
    
    // Search patient useEffect
    useEffect(() => {
        const delay = setTimeout(() => {
        const term = searchTerm.toLowerCase();

        const filtered = medications.filter(
            (medication) =>
            medication.medicationName.toLowerCase().includes(term) ||
            medication.batchNumber.toLowerCase().includes(term)
        );

        setFilteredMedications(filtered);
        }, 300);

        return () => clearTimeout(delay);
    }, [searchTerm, medications]);

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
                <Link
                    to={"/medications/create"}
                    className="btn btn-primary whitespace-nowrap"
                >
                    <span>+ Add Medication</span>
                </Link>
                </div>
            </div>
            </div>

            {loading && (
            <div className="text-center text-primary py-10">
                Loading medications...
            </div>
            )}

            {!loading && medications.length > 0 && (
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                <table className="table">
                <thead>
                    <tr>
                    <th>#</th>
                    <th>Medication Name</th>
                    <th>Batch Number</th>
                    <th>Quantity</th>
                    <th className="text-right"></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMedications.map((medication, index) => (
                    <tr key={medication._id}>
                        <th>{index + 1}</th>
                        <td>{medication.medicationName}</td>
                        <td>{medication.batchNumber}</td>
                        <td>{medication.quantity}</td>

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
                                to={`/medications/${medication._id}`}
                                className="btn btn-ghost"
                                >
                                <span>View</span>
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
            )}

            {!loading && filteredMedications.length === 0 && (
            <MedicationsNotFound />
            )}
        </div>
        </div>
  )
}

export default MedicationPage