"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { isStaffSubdomain } from "@/utils/subdomain-utils"
import styles from "@/styles/error-page.module.css"

export default function NotFoundPage() {
  const router = useRouter()
  const [onStaffSubdomain, setOnStaffSubdomain] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setOnStaffSubdomain(isStaffSubdomain())
  }, [])

  const redirectPath = isClient && onStaffSubdomain ? "/" : "/clientportal"
  const redirectLabel = isClient && onStaffSubdomain ? "Go to Staff Dashboard" : "Go to Client Portal"
  const subMessage =
    isClient && onStaffSubdomain
      ? "This page is not available in the staff portal."
      : "This page is not available in the client portal."

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
          <p className={styles.errorSubMessage}>{subMessage}</p>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button onClick={() => router.push(redirectPath)} className={styles.primaryButton}>
            {redirectLabel}
          </button>

          <button onClick={() => router.back()} className={styles.secondaryButton}>
            Go Back
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
