import { Activity, Brain, Hand, GraduationCap, MessageSquare } from "lucide-react"
import styles from "../styles/welcome.module.css"

export function WelcomeView() {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeContent}>
        <div className={styles.welcomeHeader}>
          <h5 className={styles.welcomeTitle}>Welcome to Therapy Management System</h5>
          <p className={styles.welcomeSubtitle}>
            Select a department from the sidebar to manage patients and assignments
          </p>
        </div>

        <div className={styles.cardsGrid}>
          <div className={styles.departmentCard}>
            <Activity className={`${styles.cardIcon} ${styles.blue}`} />
            <h5 className={styles.cardTitle}>Physical Therapy</h5>
            <p className={styles.cardDescription}>Manage physical therapy patients and assignments</p>
          </div>

          <div className={styles.departmentCard}>
            <Brain className={`${styles.cardIcon} ${styles.purple}`} />
            <h5 className={styles.cardTitle}>ABA</h5>
            <p className={styles.cardDescription}>Applied Behavior Analysis patient management</p>
          </div>

          <div className={styles.departmentCard}>
            <Hand className={`${styles.cardIcon} ${styles.green}`} />
            <h5 className={styles.cardTitle}>Occupational Therapy</h5>
            <p className={styles.cardDescription}>Occupational therapy services and patient care</p>
          </div>

          <div className={styles.departmentCard}>
            <GraduationCap className={`${styles.cardIcon} ${styles.orange}`} />
            <h5 className={styles.cardTitle}>Special Education</h5>
            <p className={styles.cardDescription}>Special education programs and student management</p>
          </div>

          <div className={styles.departmentCard}>
            <MessageSquare className={`${styles.cardIcon} ${styles.red}`} />
            <h5 className={styles.cardTitle}>Speech Therapy</h5>
            <p className={styles.cardDescription}>Speech and language therapy services</p>
          </div>
        </div>
      </div>
    </div>
  )
}
