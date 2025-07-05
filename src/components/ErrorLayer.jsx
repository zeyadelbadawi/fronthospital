import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import styles from "../styles/utility-components.module.css"

const ErrorLayer = () => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <h1 className={styles.errorTitle}>404</h1>
        <h6 className={styles.errorDescription}>Sorry, the page you are looking for doesn't exist</h6>
        <Link href="/" className={styles.errorButton}>
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default ErrorLayer
