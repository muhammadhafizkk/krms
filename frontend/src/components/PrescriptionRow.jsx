const PrescriptionRow = ({ item }) => {
  const med = item.medication;
  return (
    <div className="bg-base-200 rounded-lg p-3 text-sm flex justify-between items-center">
      <div>
        <div className="font-semibold">{med?.medicationName || "Unknown medication"}</div>
        <div className="opacity-70">
          {item.quantity} {med?.unit} · {med?.dosage}
        </div>
      </div>
      <span className={`badge badge-outline badge-sm ${med?.dispensingCategory === "OTC" ? "badge-success" : "badge-warning"}`}>
        {med?.dispensingCategory}
      </span>
    </div>
  );
};

export default PrescriptionRow;