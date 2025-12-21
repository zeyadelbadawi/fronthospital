"use client"

import { useEffect, useState } from "react"
import axiosInstance from "../helper/axiosSetup"
import StudentWeekTable from "./StudentWeekTable"
import Loader from "./Loader"
import { useLanguage } from "../contexts/LanguageContext"

const StudentCalendarMainLayer = () => {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const { language } = useLanguage()

  // Add this function at the top of the component
  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error("Error decoding token:", error)
      return null
    }
  }

  // Alternative getCurrentUser function using token verification
  const getCurrentUserFromToken = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return null
      }

      // Decode token to get user info
      const decodedToken = decodeToken(token)
      if (!decodedToken) {
        console.error("Invalid token")
        return null
      }

      // Verify role is patient
      if (decodedToken.role !== "patient") {
        console.error("Access denied: User is not a Student")
        window.location.href = "/unauthorized"
        return null
      }

      // Still call the profile endpoint for complete user data
      const response = await axiosInstance.get("/authentication/profile")
      const userData = response.data

      // Double-check role matches token
      if (userData.role !== decodedToken.role) {
        console.error("Token role mismatch")
        return null
      }

      setUser(userData)
      return userData
    } catch (error) {
      return null
    }
  }

  // Get current user profile
  const getCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("/authentication/profile")
      const userData = response.data

      // Verify user role is patient
      if (userData.role !== "patient") {
        console.error("Access denied: User is not a Student")
        // Redirect to appropriate page or show error
        window.location.href = "/unauthorized"
        return null
      }

      setUser(userData)
      return userData
    } catch (error) {
      return null
    }
  }

  // Get student's appointments from StudentsAppointmentDepartment
  const getStudentAppointments = async (userId) => {
    try {
      setIsLoading(true)

      // First get all appointments
      const allAppointmentsResponse = await axiosInstance.get("/appointments/")
      const allAppointments = allAppointmentsResponse.data.appointments

      // Then get student's assigned appointments for each appointment
      const studentAppointments = []

      for (const appointment of allAppointments) {
        try {
          const studentAssignmentResponse = await axiosInstance.get(
            `/students-appointment/${appointment.department}/${appointment._id}`,
          )

          const studentsInAppointment = studentAssignmentResponse.data.studentsAppointment

          // Check if current user is assigned to this appointment
          const isStudentAssigned = studentsInAppointment.some(
            (studentAssignment) => studentAssignment.patientId._id === userId,
          )

          if (isStudentAssigned) {
            studentAppointments.push(appointment)
          }
        } catch (error) {
          // Skip this appointment if there's an error fetching student assignments
        }
      }

      setAppointments(studentAppointments)
    } catch (error) {
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initializeStudentCalendar = async () => {
      const currentUser = await getCurrentUserFromToken()
      if (currentUser && currentUser.id && currentUser.role === "patient") {
        await getStudentAppointments(currentUser.id)
      } else if (currentUser && currentUser.role !== "patient") {
        // Handle non-patient users
        console.error("Access denied: Only Students can view this calendar")
      }
    }

    initializeStudentCalendar()
  }, [])

  return isLoading ? (
    <Loader />
  ) : (
    <StudentWeekTable
      evaluations={appointments}
      studentName={user?.name || (language === "ar" ? "الطالب" : "Student")}
      studentId={user?.id}
      language={language}
    />
  )
}

export default StudentCalendarMainLayer
