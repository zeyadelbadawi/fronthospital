"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { isStaffSubdomain } from "@/utils/subdomain-utils"
import styles from "./styles/error-page.module.css"

export default function ErrorPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [onStaffSubdomain, setOnStaffSubdomain] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setOnStaffSubdomain(isStaffSubdomain())
  }, [])

  const errorTitle = onStaffSubdomain ? "Access Denied - Staff Portal" : "Access Denied - Client Portal"
  const errorMessage = onStaffSubdomain
    ? "You don't have permission to access this resource. This page is restricted to authorized medical professionals only."
    : "You don't have permission to access this resource. Please sign in to your account to continue."

  const redirectPath = onStaffSubdomain ? "/sign-in" : "/clientportal"
  const redirectLabel = onStaffSubdomain ? "Go to Staff Sign In" : "Go to Client Portal"

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
          <div className={styles.errorCode}>403</div>
          <h1 className={styles.errorTitle}>{errorTitle}</h1>
          <p className={styles.errorMessage}>{errorMessage}</p>
          <p className={styles.errorSubMessage}>
            {onStaffSubdomain
              ? "If you believe this is an error, please contact your administrator."
              : "If you don't have an account, please create one to get started."}
          </p>
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
