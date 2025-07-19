"use client"
import Link from "next/link"
import { useState } from "react"
import { RiGlobalLine, RiArrowDownSLine } from "react-icons/ri"
import styles from "../styles/Header.module.css"
import { useLanguage } from "../contexts/LanguageContext"

export default function Header({
  user,
  loading,
  onLoginClick,
  onLogout,
  logoSrc = "/assets/logo.png",
  title = "Rukn Elwatikon Center Client Portal",
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { language, toggleLanguage } = useLanguage()

  const isRTL = language === "ar"

  return (
    <header className={`${styles.header} ${isRTL ? styles.rtl : styles.ltr}`}>
      <Link href="/clientportal" className={styles.logoContainer}>
        <img src={logoSrc || "/placeholder.svg"} className={styles.logo} alt="Rukn Elwatikon Center Logo" />
      </Link>

      <div className={styles.titleContainer}>
        <h3 className={styles.title}>{language === "ar" ? "بوابة مركز ركن الواتيكون للمرضى" : title}</h3>
      </div>

      <div className={styles.userSection}>
        {/* Language Switcher */}
        <button className={styles.languageButton} onClick={toggleLanguage}>
          <RiGlobalLine />
          <span>{language === "en" ? "العربية" : "English"}</span>
        </button>

        {!loading && user && user.role === "patient" ? (
          <div className={styles.dropdown}>
            <button className={styles.dropdownButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
              {user.name}
              <RiArrowDownSLine />
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link
                  href="/calendar-main-patient"
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  {language === "ar" ? "مواعيدي" : "My Appointments"}
                </Link>
                <hr className={styles.dropdownDivider} />
                <button
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={() => {
                    setDropdownOpen(false)
                    onLogout()
                  }}
                >
                  {language === "ar" ? "تسجيل الخروج" : "Log out"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.loginButton} onClick={onLoginClick}>
            {language === "ar" ? "تسجيل الدخول" : "Login"}
          </button>
        )}
      </div>
    </header>
  )
}
