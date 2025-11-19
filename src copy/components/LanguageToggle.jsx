"use client"
import { useLanguage } from "@/contexts/LanguageContext"
import { Globe, Languages } from "lucide-react"

const LanguageToggle = ({ className = "" }) => {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className={`language-toggle-btn ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1rem",
        background: "linear-gradient(135deg, #e91e63 0%, #4a4a8a 100%)",
        color: "white",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: "600",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 15px rgba(233, 30, 99, 0.3)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)"
        e.target.style.boxShadow = "0 6px 20px rgba(233, 30, 99, 0.4)"
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)"
        e.target.style.boxShadow = "0 4px 15px rgba(233, 30, 99, 0.3)"
      }}
    >
      <Languages size={18} />
      <span>{language === "ar" ? "English" : "العربية"}</span>
      <Globe size={16} />
    </button>
  )
}

export default LanguageToggle
