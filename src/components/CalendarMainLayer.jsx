"use client"
import { useState, useEffect } from "react"
import ImprovedCalendar from "./WeekTable"
import Loader from "./Loader"
import axiosInstance from "@/helper/axiosSetup"

const CalendarMainLayer = ({ user }) => {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const getCalendarEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      let endpoint = `${process.env.NEXT_PUBLIC_API_URL}/appointments`

      // If user is a doctor, you might want to filter by doctor ID
      if (user?.role === "doctor") {
        endpoint = `${process.env.NEXT_PUBLIC_API_URL}/appointments?doctorId=${user.id}`
      }

      const response = await axiosInstance.get(endpoint)
      if (response.status === 200) {
        setIsLoading(false)
        setAppointments(response?.data?.appointments || [])
      }
    } catch (error) {
      setIsLoading(false)
      setError("Failed to load appointments")
      console.error("error to get appointments", error.response)
    }
  }

  useEffect(() => {
    getCalendarEvents()
  }, [currentWeek, user])

  const handleWeekChange = (newWeek) => {
    setCurrentWeek(newWeek)
  }

  if (isLoading) {
    return <Loader />
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          flexDirection: "column",
        }}
      >
        <p style={{ color: "#ef4444", fontSize: "1rem", marginBottom: "0.5rem" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <ImprovedCalendar
        evaluations={appointments}
        currentWeek={currentWeek}
        onWeekChange={handleWeekChange}
        user={user}
      />
    </div>
  )
}

export default CalendarMainLayer
