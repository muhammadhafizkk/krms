import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { formatDate } from "../lib/utils";
import Detail from "../components/Detail"

const PatientDetailPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/patients/${id}`);
        setPatient(res.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load patient");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!patient) {
    return <div className="text-center py-10">Patient not found</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-start p-6">
      <div className="card bg-base-100 shadow-xl w-full max-w-6xl">

        <div className="card-body">

          <div className="flex flex-col md:flex-row gap-6">

            {/* LEFT SIDE */}
            <div className="flex flex-col items-center md:w-1/3 text-center">

              {/* Avatar */}
              <div className="avatar">
                <div className="w-32 rounded-full bg-base-200 flex items-center justify-center text-4xl font-bold">
                  {patient.fullName.charAt(0)}
                </div>
              </div>

              {/* Name */}
              <h2 className="text-xl font-semibold mt-4">
                {patient.fullName}
              </h2>

              {/* Edit Button */}
              <Link
                to={`/patients/edit/${patient._id}`}
                className="btn btn-primary mt-4 w-full"
              >
                Edit Details
              </Link>
            </div>

            {/* DIVIDER */}
            <div className="divider md:divider-horizontal"></div>

            {/* RIGHT SIDE */}
            <div className="flex-1 grid grid-cols-2 gap-4">

              <Detail label="NRIC" value={patient.NRIC} />
              <Detail label="Date of Birth" value={formatDate(new Date(patient.dateOfBirth))} />
              <Detail label="Race" value={patient.race} />
              <Detail label="Sex" value={patient.sex} />
              <Detail label="Contact Number" value={patient.contactNumber} />
              <Detail label="Address" value={patient.address} />

              <Detail label="Created At" value={formatDate(new Date(patient.createdAt))} />
              <Detail label="Last Updated" value={formatDate(new Date(patient.updatedAt))} />

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage;