import styles from "../styles/patients-view.module.css"

export function PatientsView({ department }) {
  return (
    <div className={styles.patientsViewContainer}>
      <div className={styles.patientsViewCard}>
        <div className={styles.patientsViewHeader}>
          <h2 className={styles.patientsViewTitle}>{department} Patients</h2>
          <p className={styles.patientsViewSubtitle}>View and manage {department.toLowerCase()} patients</p>
        </div>
        <div className={styles.patientsViewBody}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No patients found</h3>
            <p className={styles.emptyDescription}>
              {department} patients will appear here once they are assigned to this department.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
