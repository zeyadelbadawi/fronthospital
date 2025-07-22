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

  // Get current user profile
  const getCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("/authentication/profile")
      const userData = response.data

      // Verify user role is patient
      if (userData.role !== "patient") {
        console.error("Access denied: User is not a patient")
        window.location.href = "/unauthorized"
        return null
      }

      setUser(userData)
      return userData
    } catch (error) {
      console.log("Error getting current user:", error.response)
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
          console.log(`Error fetching assignments for appointment ${appointment._id}:`, error)
        }
      }

      setAppointments(studentAppointments)
      console.log("Student appointments fetched successfully:", studentAppointments)
    } catch (error) {
      setIsLoading(false)
      console.log("Error fetching student appointments:", error.response)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initializeStudentCalendar = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser && currentUser.id) {
        await getStudentAppointments(currentUser.id)
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
