import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router"

export default function BackButton({
  label = "Back",
  fallbackPath = "/",
  className = ""
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    // If there is browser history, go back
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      // Fallback route if no history exists
      navigate(fallbackPath)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`btn btn-primary gap-2 ${className}`}
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  )
}