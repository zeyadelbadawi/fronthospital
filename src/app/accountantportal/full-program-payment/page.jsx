"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AccountantHeader from "../../../components/accountant-header"
import { AccountantAppointments } from "../../../components/accountant-appointments"
import { useAccountantLanguage } from "../../../contexts/accountant-language-context"
import axiosInstance from "@/helper/axiosSetup"
export default function FullProgramPaymentPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { language } = useAccountantLanguage()

  useEffect(() => {
    const checkAuth = async () => {

      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

     

      if (!token) {
        router.push("/accountantportal")
        return
      }

      // Try to use stored user data first
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData)

          if (parsedUser.role === "accountant") {
            setUser(parsedUser)
            setLoading(false)
            return
          } else {
            router.push("/accountantportal")
            return
          }
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }

      // If no user data in localStorage, try to fetch from API
      try {
        const response = await axiosInstance.get("/authentication/profile")

        if (response.data && response.data.role === "accountant") {
          localStorage.setItem("user", JSON.stringify(response.data))
          setUser(response.data)
        } else {
          router.push("/accountantportal")
          return
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        // If API call fails, redirect to login
        router.push("/accountantportal")
        return
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/authentication/logout")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      router.push("/accountantportal")
    } catch (error) {
      console.error("Logout error:", error)
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      router.push("/accountantportal")
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p>{language === "ar" ? "جاري التحميل..." : "Loading..."}</p>
      </div>
    )
  }

  if (!user || user.role !== "accountant") {
    return null // Will redirect in useEffect
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <AccountantHeader
        user={user}
        loading={false}
        onLoginClick={() => router.push("/accountantportal")}
        onLogout={handleLogout}
      />
      <AccountantAppointments />
    </div>
  )
}
