"use client"
import { createContext, useContext, useState, useEffect } from "react"

const CookieConsentContext = createContext()

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider")
  }
  return context
}

export const CookieConsentProvider = ({ children }) => {
  const [showBanner, setShowBanner] = useState(false)
  const [consentGiven, setConsentGiven] = useState(null)

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("cookieConsent")
    if (consent === null) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000)
    } else {
      setConsentGiven(consent === "accepted")
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setConsentGiven(true)
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined")
    setConsentGiven(false)
    setShowBanner(false)
  }

  return (
    <CookieConsentContext.Provider
      value={{
        showBanner,
        consentGiven,
        acceptCookies,
        declineCookies,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}
