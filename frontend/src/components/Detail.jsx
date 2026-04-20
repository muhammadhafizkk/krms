
const Detail = ({ label, value }) => (
  <div className="bg-base-100 p-3 rounded-lg">
    <p className="text-sm opacity-70">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
)

export default Detail