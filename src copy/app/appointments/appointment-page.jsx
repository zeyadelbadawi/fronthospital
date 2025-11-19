"use client"

import { useState, useEffect, useContext } from "react"
import axiosInstance from "../../helper/axiosSetup"
import { useRouter } from "next/navigation"
import CustomLink from '@/components/CustomLink'
import { ModelContextInst } from "@/contexts/ModelContext"
import UpdateModel from "@/components/UpdateModel"
import Loader from "@/components/Loader"
import { convertUTCTo12Hour, convertUTCTo24Hour } from "@/helper/DateTime"
import AppointmentUpdate from "./updateAppointment"
import DeleteModel from "@/components/DeleteModel"
import DeleteAppointment from "./deleteAppointments"
import styles from "@/styles/appointment-page.module.css"
import toastStyles from "@/styles/toast.module.css" // Import toast styles

export default function AppointmentPage() {
  const [appointments, setAppointments] = useState([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [currentId, setCurrentId] = useState()
  const [selectedAppointment, setSelectedAppointment] = useState({})
  const {
    openUpdateModal,
    showUpdateModal,
    closeUpdateModal,
    showDeleteModal,
    openDeleteModal,
    closeDeleteModal,
    setIsLoading,
    isLoading,
  } = useContext(ModelContextInst)

  // Toast state
  const [toastMessage, setToastMessage] = useState({ type: "", message: "", visible: false })

  // Toast function
  const showToast = (type, message) => {
    setToastMessage({ type, message, visible: true })
    setTimeout(() => {
      setToastMessage((prev) => ({ ...prev, visible: false }))
    }, 3000) // Hide after 3 seconds
  }

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get("/appointments/")
      setAppointments(response.data)
      setTotalPages(Math.ceil(response?.data?.appointments?.length / 10))
    } catch (error) {
      setLoading(false)
      showToast("error", `Error fetching appointments: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const onUpdateClose = () => {
    setIsLoading(false)
    setSelectedAppointment({})
    setCurrentId(null)
    closeUpdateModal()
  }

  const onDeleteClose = () => {
    setIsLoading(false)
    setCurrentId(null)
    closeDeleteModal()
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className={styles.appointmentContainer}>
      {/* Toast Notification */}
      {toastMessage.visible && (
        <div className={`${toastStyles.toast} ${toastStyles[toastMessage.type]}`}>{toastMessage.message}</div>
      )}

      {/* Card Header with Search and Add New Appointment Button */}
      <div className={styles.cardHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Appointments</h1>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchForm}>
            <div className={styles.searchInputContainer}>
              <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                name="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search appointments..."
              />
            </div>
          </div>
          <CustomLink href="/appointments/add-appointments" className={styles.addButton}>
            <svg className={styles.addButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Appointment
          </CustomLink>
        </div>
      </div>

      {/* Appointment Table */}
      <div className={styles.cardBody}>
        <div className={styles.tableContainer}>
          <table className={styles.appointmentsTable}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>#</th>
                <th>Day</th>
                <th>Department</th>
                <th>Slot</th>
                <th>Doctor</th>
                <th className={styles.centerHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className={styles.loadingRow}>
                    <Loader text="Loading appointments..." />
                  </td>
                </tr>
              ) : (
                appointments.appointments?.map((appointment, index) => (
                  <tr key={appointment._id} className={styles.tableRow}>
                    <td className={styles.indexCell}>{index + 1}</td>
                    <td className={styles.dayCell}>{appointment.day}</td>
                    <td className={styles.departmentCell}>{appointment.department}</td>
                    <td className={styles.slotCell}>
                      {`${convertUTCTo12Hour(appointment.start_time)} - ${convertUTCTo12Hour(appointment.end_time)}`}
                    </td>
                    <td className={styles.doctorCell}>{appointment.doctor.username}</td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        <CustomLink
                          href={`/appointments/${appointment._id}`}
                          className={`${styles.actionButton} ${styles.viewButton}`}
                        >
                          <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </CustomLink>
                        <button
                          type="button"
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={() => {
                            setCurrentId(appointment._id)
                            setSelectedAppointment({
                              doctor: appointment.doctor._id,
                              day: appointment.day,
                              department: appointment.department,
                              start_time: convertUTCTo24Hour(appointment.start_time).split(" ")[0],
                              end_time: convertUTCTo24Hour(appointment.end_time).split(" ")[0],
                            })
                            openUpdateModal()
                          }}
                        >
                          <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => {
                            openDeleteModal()
                            setCurrentId(appointment._id)
                          }}
                        >
                          <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.paginationContainer}>
          <span className={styles.paginationInfo}>
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, appointments?.appointments?.length)} of{" "}
            {appointments?.appointments?.length} entries
          </span>
          <ul className={styles.paginationList}>
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`${styles.paginationItem} ${currentPage === i + 1 ? styles.paginationActive : ""}`}
              >
                <button className={styles.paginationLink} onClick={() => handlePageChange(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modals */}
      <UpdateModel title="Update Appointment Slot" closeFun={onUpdateClose} color="bg-warning">
        <AppointmentUpdate
          appointmentId={currentId}
          currentData={selectedAppointment}
          onSuccess={() => {
            fetchAppointments()
            onUpdateClose()
            showToast("success", "Appointment updated successfully!")
          }}
        />
      </UpdateModel>

      <DeleteModel closeFun={onDeleteClose} color="bg-danger" title="Delete Appointment Slot">
        <DeleteAppointment
          currentId={currentId}
          onSuccess={() => {
            fetchAppointments()
            onDeleteClose()
            showToast("success", "Appointment deleted successfully!")
          }}
        />
      </DeleteModel>
    </div>
  )
}
