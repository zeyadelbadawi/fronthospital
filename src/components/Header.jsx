"use client"
import Link from "next/link"
import { useState } from "react"
import styles from "../styles/Header.module.css"

export default function Header({
  user,
  loading,
  onLoginClick,
  onLogout,
  logoSrc = "/assets/logo.png",
  title = "Rukn Elwatikon Center Client Portal",
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <header className={styles.header}>
      <Link href="/clientportal" className={styles.logoContainer}>
        <img src={logoSrc || "/placeholder.svg"} className={styles.logo} alt="Rukn Elwatikon Center Logo" />
      </Link>

      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.userSection}>
        {!loading && user && user.role === "patient" ? (
          <div className={styles.dropdown}>
            <button className={styles.dropdownButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
              {user.name}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link
                  href="/calendar-main-patient"
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  My Appointments
                </Link>
                <hr className={styles.dropdownDivider} />
                <button
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={() => {
                    setDropdownOpen(false)
                    onLogout()
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.loginButton} onClick={onLoginClick}>
            Login
          </button>
        )}
      </div>
    </header>
  )
}
