"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import Header from "@/components/Header"
import AdminStudentBooking from "@/components/AdminStudentBooking"
import styles from "./Admin-Book-Appointment.module.css"
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";

export default function AdminBookAppointmentPage() {

  const router = useRouter()

  // --- Auth & User State for Header ---
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Check if user is admin
      if (res.data.role !== "admin") {
        alert("You are not authorized to access this page")
        router.push("/")
        return
      }

      setUser(res.data)
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const r = await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_API_URL}/authentication/refresh`,
            {},
            { withCredentials: true },
          )
          localStorage.setItem("token", r.data.accessToken)
          const retry = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_URL}/authentication/profile`, {
            headers: { Authorization: `Bearer ${r.data.accessToken}` },
          })

          // Check if user is admin after refresh
          if (retry.data.role !== "admin") {
            alert("You are not authorized to access this page")
            router.push("/")
            return
          }

          setUser(retry.data)
        } catch (refreshErr) {
          console.error("Refresh failed:", refreshErr)
          router.push("/")
        }
      } else {
        router.push("/")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // --- Admin Book-Appointment Step Logic ---
  const [currentStep, setCurrentStep] = useState(0) // Start from 0 for patient selection

  // Show loading or redirect if not admin
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return (
      <div className={styles.unauthorizedContainer}>
        <h2> Unauthorized"</h2>
        <p> You must be an admin to access this page</p>
      </div>
    )
  }

  return (
        <>
      {/* MasterLayout */}
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb 
  heading="Book New Appointments" 
  title=" Book New Appointments" 
/>
 

      <div className={styles.wizardContainer}>
        <AdminStudentBooking
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          adminId={user?.id}
          adminName={user?.name}
        />

    </div>
          </MasterLayout>
    </>
  )
}
