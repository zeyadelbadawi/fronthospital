"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, User, X, Save, AlertCircle } from 'lucide-react'
import styles from "../styles/edit-departments.module.css"
import axiosInstance from "@/helper/axiosSetup"

export function EditDepartments() {
    const [appointments, setAppointments] = useState([])
    const [filteredAppointments, setFilteredAppointments] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [itemsPerPage] = useState(10)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const [selectedDepartments, setSelectedDepartments] = useState({})
    const [previousDepartments, setPreviousDepartments] = useState({})
    const [doctorNotes, setDoctorNotes] = useState("")

    // Department mapping for backend endpoints
    const departmentEndpoints = {
        ABA: "aba",
        Speech: "speech",
        SpecialEducation: "SpecialEducation",
        PhysicalTherapy: "physicalTherapy",
        OccupationalTherapy: "OccupationalTherapy",
    }

    const departmentsList = [
        { id: "ABA", label: "ABA (Applied Behavior Analysis)", description: "Behavioral therapy and analysis" },
        { id: "Speech", label: "Speech Therapy", description: "Speech and language therapy" },
        { id: "SpecialEducation", label: "Special Education", description: "Specialized educational support" },
        { id: "PhysicalTherapy", label: "Physical Therapy", description: "Physical rehabilitation and exercise" },
        { id: "OccupationalTherapy", label: "Occupational Therapy", description: "Occupational and daily living skills" },
        { id: "Psychotherapy", label: "Psychotherapy", description: "Mental health counseling (Not Available)", disabled: true },
    ]

    useEffect(() => {
        fetchActiveAppointments()
    }, [])

    useEffect(() => {
        filterAppointments()
    }, [appointments, search])

    const fetchPatientName = async (patientId) => {
        try {
            const response = await axiosInstance.get(`/authentication/patient/${patientId}`)
            return response.data.name || `Student-${patientId}`
        } catch (error) {
            console.error("Error fetching Student name:", error)
            return `Student-${patientId}`
        }
    }

    const fetchActiveAppointments = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get("/full/fullprogram")
            const data = response.data

            // Filter for active appointments awaiting or already having payment
            const activeAppointments = data.filter(
                (appointment) =>
                    appointment.status === "active" &&
                    appointment.programType === "full_program" &&
                    appointment.paymentStatus !== "FULLY_PAID",
            )

            const appointmentsWithNames = await Promise.all(
                activeAppointments.map(async (appointment) => {
                    const patientName = await fetchPatientName(appointment.patientid)
                    return {
                        ...appointment,
                        patientName: patientName,
                    }
                }),
            )

            const sortedAppointments = appointmentsWithNames.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`)
                const dateTimeB = new Date(`${b.date}T${b.time}`)
                return dateTimeB - dateTimeA
            })

            setAppointments(sortedAppointments)
        } catch (error) {
            console.error("Error fetching appointments:", error)
        } finally {
            setLoading(false)
        }
    }

    const filterAppointments = () => {
        let filtered = appointments

        if (search) {
            filtered = filtered.filter(
                (appointment) =>
                    (appointment.patientName && appointment.patientName.toLowerCase().includes(search.toLowerCase())) ||
                    (appointment.description && appointment.description.toLowerCase().includes(search.toLowerCase())),
            )
        }

        setFilteredAppointments(filtered)
        setTotalPages(Math.ceil(filtered.length / itemsPerPage))
        setCurrentPage(1)
    }

    const handleDepartmentChange = async (departmentId, isChecked) => {
        const newState = { ...selectedDepartments, [departmentId]: isChecked }
        setSelectedDepartments(newState)

        // No immediate API call here - will be handled on save
    }

    const syncDepartmentsWithBackend = async (patientId, previousDepts, newDepts) => {
        const errors = []
        const successes = []

        try {
            // Determine which departments were removed
            for (const deptId of Object.keys(previousDepts)) {
                if (previousDepts[deptId] && !newDepts[deptId]) {
                    try {
                        const route = `/${departmentEndpoints[deptId]}/unassign-from-${deptId === "OccupationalTherapy" ? "OccupationalTherapy" : deptId === "SpecialEducation" ? "SpecialEducation" : deptId === "PhysicalTherapy" ? "physical" : deptId}/${patientId}`
                        await axiosInstance.delete(route)
                        successes.push(`Unassigned from ${deptId}`)
                    } catch (err) {
                        console.error(`Error unassigning from ${deptId}:`, err)
                        errors.push(`Failed to unassign from ${deptId}: ${err.response?.data?.message || err.message}`)
                    }
                }
            }

            // Determine which departments were added
            for (const deptId of Object.keys(newDepts)) {
                if (newDepts[deptId] && !previousDepts[deptId]) {
                    try {
                        const route = `/${departmentEndpoints[deptId]}/assign-to-${deptId === "OccupationalTherapy" ? "Occupational" : deptId === "SpecialEducation" ? "Special-Education" : deptId === "PhysicalTherapy" ? "physical" : deptId}`
                        await axiosInstance.post(route, { patientId: patientId })
                        successes.push(`Assigned to ${deptId}`)
                    } catch (err) {
                        console.error(`Error assigning to ${deptId}:`, err)
                        errors.push(`Failed to assign to ${deptId}: ${err.response?.data?.message || err.message}`)
                    }
                }
            }

            return { errors, successes }
        } catch (err) {
            console.error("Unexpected error during department sync:", err)
            throw err
        }
    }

    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment)
        setError("")
        setSuccess("")

        if (appointment.selectedDepartments && appointment.selectedDepartments.length > 0) {
            const deptMap = {}
            departmentsList.forEach((dept) => {
                deptMap[dept.id] = appointment.selectedDepartments.includes(dept.id)
            })
            setSelectedDepartments(deptMap)
            setPreviousDepartments({ ...deptMap })
        } else {
            const deptMap = {}
            departmentsList.forEach((dept) => {
                deptMap[dept.id] = !dept.disabled
            })
            setSelectedDepartments(deptMap)
            setPreviousDepartments({ ...deptMap })
        }

        setDoctorNotes(appointment.doctorNotes || "")
        setShowEditModal(true)
    }

    const handleSaveDepartments = async () => {
        if (!selectedAppointment) return

        // Validation
        const selectedDeptArray = Object.keys(selectedDepartments).filter((dept) => selectedDepartments[dept])
        if (selectedDeptArray.length === 0) {
            setError("Please select at least one department")
            return
        }

        if (!selectedAppointment.patientid) {
            setError("Student ID is missing")
            return
        }

        try {
            setSaving(true)
            setError("")
            setSuccess("")

            console.log("[v0] Syncing departments with backend...")
            const { errors, successes } = await syncDepartmentsWithBackend(
                selectedAppointment.patientid,
                previousDepartments,
                selectedDepartments,
            )

            if (errors.length > 0) {
                console.error("[v0] Department sync errors:", errors)
                setError(`Some departments failed to update: ${errors.join(", ")}`)
            }

            console.log("[v0] Updating FullProgram record...")
            const response = await axiosInstance.put(`/full/fullprogram/${selectedAppointment._id}`, {
                selectedDepartments: selectedDeptArray,
                doctorNotes: doctorNotes,
            })

            setAppointments(
                appointments.map((app) =>
                    app._id === selectedAppointment._id
                        ? {
                            ...app,
                            selectedDepartments: selectedDeptArray,
                            doctorNotes: doctorNotes,
                        }
                        : app,
                ),
            )

            setSuccess(
                `Department selection updated successfully! ${successes.length > 0 ? "Updated: " + successes.join(", ") : ""}`,
            )
            setTimeout(() => {
                closeModal()
            }, 2000)
        } catch (error) {
            console.error("[v0] Error updating departments:", error)
            setError("Error updating departments: " + (error.response?.data?.message || error.message))
        } finally {
            setSaving(false)
        }
    }

    const closeModal = () => {
        setShowEditModal(false)
        setSelectedAppointment(null)
        setSelectedDepartments({})
        setPreviousDepartments({})
        setDoctorNotes("")
        setError("")
        setSuccess("")
    }

    const getDepartmentBadges = (appointment) => {
        if (!appointment.selectedDepartments || appointment.selectedDepartments.length === 0) {
            return <span className={styles.noBadge}>No departments selected</span>
        }

        return (
            <div className={styles.departmentBadges}>
                {appointment.selectedDepartments.map((dept) => (
                    <span key={dept} className={styles.badge}>
                        {departmentsList.find((d) => d.id === dept)?.label || dept}
                    </span>
                ))}
            </div>
        )
    }

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentAppointments = filteredAppointments.slice(startIndex, endIndex)

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.pageTitle}>Edit Department Selection</h2>
                        <p className={styles.pageSubtitle}>Modify department assignments before payment is finalized</p>
                    </div>
                    <div className={styles.headerActions}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                filterAppointments()
                            }}
                            className={styles.searchForm}
                        >
                            <div className={styles.searchInputContainer}>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search appointments..."
                                />
                                <Search className={styles.searchIcon} />
                            </div>
                        </form>
                    </div>
                </div>

                <div className={styles.cardBody}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}></div>
                            <p className={styles.loadingText}>Loading appointments...</p>
                        </div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.appointmentsTable}>
                                <thead>
                                    <tr className={styles.tableHeader}>
                                        <th>#</th>
                                        <th>
                                            <div className={styles.headerCell}>
                                                <User className={styles.headerIcon} />
                                                Student
                                            </div>
                                        </th>
                                        <th>
                                            <div className={styles.headerCell}>
                                                <Calendar className={styles.headerIcon} />
                                                Evaluation Date
                                            </div>
                                        </th>
                                        <th>
                                            <div className={styles.headerCell}>
                                                <AlertCircle className={styles.headerIcon} />
                                                Selected Departments
                                            </div>
                                        </th>
                                        <th className={styles.textCenter}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAppointments && currentAppointments.length > 0 ? (
                                        currentAppointments.map((appointment, index) => (
                                            <tr key={appointment._id} className={styles.tableRow}>
                                                <td className={styles.indexCell}>{startIndex + index + 1}</td>
                                                <td className={styles.patientCell}>
                                                    <span className={styles.patientName}>
                                                        {appointment.patientName || `Student-${appointment.patientid}`}
                                                    </span>
                                                </td>
                                                <td className={styles.dateCell}>
                                                    <span className={styles.dateValue}>
                                                        {new Date(appointment.date).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                </td>
                                                <td className={styles.departmentCell}>{getDepartmentBadges(appointment)}</td>
                                                <td className={styles.actionsCell}>
                                                    <button
                                                        onClick={() => handleEdit(appointment)}
                                                        className={styles.editButton}
                                                        title="Edit Departments"
                                                    >
                                                        <Save className={styles.actionIcon} />
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className={styles.noData}>
                                                <div className={styles.emptyState}>
                                                    <AlertCircle className={styles.emptyIcon} />
                                                    <h3>No appointments found</h3>
                                                    <p>
                                                        {search
                                                            ? "Try adjusting your search"
                                                            : "No active appointments awaiting payment at this time"}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredAppointments.length > 0 && (
                        <div className={styles.paginationContainer}>
                            <span className={styles.paginationInfo}>
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredAppointments.length)} of{" "}
                                {filteredAppointments.length} appointments
                            </span>
                            <div className={styles.paginationButtons}>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.active : ""}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Departments Modal */}
            {showEditModal && selectedAppointment && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3 className={styles.modalTitle}>Edit Department Selection</h3>
                                <p className={styles.modalSubtitle}>
                                    Student: {selectedAppointment.patientName || `Student-${selectedAppointment.patientid}`}
                                </p>
                            </div>
                            <button onClick={closeModal} className={styles.closeButton} disabled={saving}>
                                <X className={styles.closeIcon} />
                            </button>
                        </div>

                        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
                        {success && <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>}

                        <div className={styles.modalBody}>
                            <div className={styles.departmentsList}>
                                {departmentsList.map((dept) => (
                                    <label key={dept.id} className={`${styles.departmentItem} ${dept.disabled ? styles.disabled : ""}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedDepartments[dept.id] || false}
                                            onChange={(e) => handleDepartmentChange(dept.id, e.target.checked)}
                                            disabled={dept.disabled || saving}
                                        />
                                        <div className={styles.departmentContent}>
                                            <span className={styles.departmentLabel}>{dept.label}</span>
                                            <span className={styles.departmentDescription}>{dept.description}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Doctor Notes (Optional)</label>
                                <textarea
                                    value={doctorNotes}
                                    onChange={(e) => setDoctorNotes(e.target.value)}
                                    className={styles.formTextarea}
                                    rows={3}
                                    placeholder="Add or edit notes about the department selection..."
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button onClick={closeModal} className={styles.cancelButton} disabled={saving}>
                                Cancel
                            </button>
                            <button onClick={handleSaveDepartments} className={styles.saveButton} disabled={saving}>
                                <Save className={styles.buttonIcon} />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
