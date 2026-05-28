import { useEffect, useState, useRef } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { SearchIcon, FileTextIcon, PrinterIcon } from "lucide-react";
import { formatDate } from "../lib/utils";
import DocumentRenderer from "../components/documents/DocumentRenderer";

const TYPE_LABELS = {
  "medical-checkup": "Medical Check-Up",
  "referral": "Referral Letter",
  "time-slip": "Time Slip",
  "sick-leave": "Sick Leave",
  "cuti-sekolah": "Cuti Sekolah",
  "receipt": "Official Receipt",
};

const TYPE_BADGE = {
  "medical-checkup": "badge-info",
  "referral": "badge-warning",
  "time-slip": "badge-ghost",
  "sick-leave": "badge-error",
  "cuti-sekolah": "badge-success",
  "receipt": "badge-neutral",
};

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const printRef = useRef(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/documents");
        setDocuments(res.data);
        setFiltered(res.data);
      } catch {
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      let result = documents;

      if (typeFilter !== "all") {
        result = result.filter((d) => d.type === typeFilter);
      }

      if (term) {
        result = result.filter(
          (d) =>
            d.patient?.fullName?.toLowerCase().includes(term) ||
            d.patient?.icNumber?.includes(term) ||
            d.serialNumber?.toLowerCase().includes(term)
        );
      }

      setFiltered(result);
      setCurrentPage(1); // Reset back to page 1 on query switch
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, typeFilter, documents]);

  // --- PAGINATION CALCULATIONS ---
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageDocuments = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrint = (doc) => {
    setTimeout(() => {
      const content = printRef.current?.innerHTML;
      if (!content) return;
      const win = window.open("", "_blank");
      win.document.write(`
        <!DOCTYPE html><html><head>
        <title>Klinik Rabiah — ${TYPE_LABELS[doc.type]}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #111; }
          @media print {
            body { margin: 0; }
            @page { size: A4; margin: 15mm; }
          }
        </style>
        </head><body>${content}</body></html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 300);
    }, 100);
  };

  const openReprint = (doc) => {
    setSelected(doc);
    document.getElementById("reprint_modal").showModal();
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 mt-6">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Document History</h1>
          <div className="w-24" />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <label className="input input-bordered flex items-center gap-2 flex-1">
            <SearchIcon className="size-4 opacity-60" />
            <input
              type="search"
              className="grow"
              placeholder="Search by patient name, NRIC, or serial no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <select
            className="select select-bordered"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-primary py-10">Loading documents...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center opacity-50 py-16 flex flex-col items-center gap-2">
            <FileTextIcon className="size-10" />
            <p>No documents found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Patient</th>
                    <th>NRIC</th>
                    <th>Serial No.</th>
                    <th>Generated By</th>
                    <th>Date</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageDocuments.map((doc, index) => (
                    <tr key={doc._id} className="hover">
                      <th>{indexOfFirstItem + index + 1}</th>
                      <td>
                        <span className={`badge badge-sm ${TYPE_BADGE[doc.type]}`}>
                          {TYPE_LABELS[doc.type]}
                        </span>
                      </td>
                      <td>{doc.patient?.fullName || "—"}</td>
                      <td className="font-mono text-sm">{doc.patient?.icNumber || "—"}</td>
                      <td className="font-mono text-sm">{doc.serialNumber || "—"}</td>
                      <td>{doc.generatedBy?.fullName || "—"}</td>
                      <td className="text-sm opacity-70">
                        {formatDate(new Date(doc.createdAt))}
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openReprint(doc)}
                        >
                          <PrinterIcon className="size-4" /> Reprint
                        </button>
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
      </div>

      {/* Hidden renderer used by handlePrint */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        {selected && (
          <div ref={printRef}>
            <DocumentRenderer
              type={selected.type}
              data={selected.data}
              patient={selected.patient}
              serialNumber={selected.serialNumber}
            />
          </div>
        )}
      </div>

      {/* Reprint modal */}
      <dialog id="reprint_modal" className="modal">
        <div className="modal-box max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{TYPE_LABELS[selected.type]}</h3>
                  <p className="text-sm opacity-60">
                    {selected.patient?.fullName} · {formatDate(new Date(selected.createdAt))}
                  </p>
                </div>
                {selected.serialNumber && (
                  <span className="badge badge-neutral font-mono text-sm">
                    {selected.serialNumber}
                  </span>
                )}
              </div>

              <div className="border border-base-300 rounded-lg overflow-auto bg-white mb-4">
                <DocumentRenderer
                  type={selected.type}
                  data={selected.data}
                  patient={selected.patient}
                  serialNumber={selected.serialNumber}
                />
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setSelected(null);
                    document.getElementById("reprint_modal").close();
                  }}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handlePrint(selected)}
                >
                  <PrinterIcon className="size-4" /> Print
                </button>
              </div>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setSelected(null)}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default DocumentsPage;