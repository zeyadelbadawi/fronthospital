"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import styles from "@/styles/error-page.module.css"

export default function ErrorPage() {
  const router = useRouter()

  return (

    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo Section */}
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <Image
              src="/images/rukn-logo.png"
              alt="Rukn Alwatikon Center"
              width={150}
              height={150}
              className={styles.logo}
              priority
            />
          </div>
        </div>

        {/* Error Content */}
        <div className={styles.errorContent}>
          <div className={styles.errorCode}>404</div>
          <h1 className={styles.errorTitle}>Page Not Found</h1>
          <p className={styles.errorMessage}>Sorry, the page you are looking for doesn't exist.</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button onClick={() => router.push("/")} className={styles.primaryButton}>
            Go to Homepage
          </button>
        </div>

        {/* Background Elements */}
        <div className={styles.backgroundElements}>
          <div className={styles.shape1}></div>
          <div className={styles.shape2}></div>
          <div className={styles.shape3}></div>
        </div>
      </div>
    </div>
 
  )
}
