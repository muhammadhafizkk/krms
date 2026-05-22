const PrescriptionRow = ({ item }) => {
  const med = item.medication;
  return (
    <div className="bg-base-200 rounded-lg p-3 text-sm flex justify-between items-start">
      <div>
        <div className="font-semibold">{med?.medicationName || "Unknown medication"}</div>
        <div className="opacity-70">
          {item.quantity} {med?.unit} · {item.dosage}
        </div>
        {item.instructions && (
          <div className="opacity-50 italic mt-0.5">{item.instructions}</div>
        )}
      </div>
      <span className="badge badge-outline badge-sm mt-0.5">
        {med?.dispensingCategory}
      </span>
    </div>
  );
};

export default PrescriptionRow;