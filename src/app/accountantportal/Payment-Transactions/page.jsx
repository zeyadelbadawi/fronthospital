"use client"
import { useEffect, useState, useCallback } from "react"
import AccountantHeader from "../../../components/accountant-header"
import PaymentTransactionsTable from "../../../components/PaymentTransactionsTable"
import { useAccountantLanguage } from "../../../contexts/accountant-language-context"
import axiosInstance from "@/helper/axiosSetup"

export default function PaymentTransactionsPage() {
  const { language } = useAccountantLanguage()

  // --- Auth & User State ---
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // --- Optimized Profile Loading ---
  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await axiosInstance.get("/authentication/profile")
      setUser(res.data)
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const r = await axiosInstance.post("/authentication/refresh")
          localStorage.setItem("token", r.data.accessToken)
          const retry = await axiosInstance.get("/authentication/profile")
          setUser(retry.data)
        } catch (refreshError) {
          localStorage.removeItem("token")
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // --- Logout Handler ---
  const handleLogout = useCallback(async () => {
    try {
      await axiosInstance.post("/authentication/logout")
      localStorage.removeItem("token")
      setUser(null)
      // Redirect to accountant portal
      window.location.href = "/accountantportal"
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }, [])

  return (
    <div>
      <AccountantHeader
        user={user}
        loading={loading}
        onLoginClick={() => {
          // Redirect to accountant portal for login
          window.location.href = "/accountantportal"
        }}
        onLogout={handleLogout}
      />
      <PaymentTransactionsTable language={language} />
    </div>
  )
}
