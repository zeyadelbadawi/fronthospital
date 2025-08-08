"use client"
import CustomLink from '@/components/CustomLink'
import { useState } from "react"
import { ChevronDown, Globe } from "lucide-react"
import styles from "../styles/AccountantHeader.module.css"
import { useAccountantLanguage } from "../contexts/accountant-language-context"

export default function AccountantHeader({
  user,
  loading,
  onLoginClick,
  onLogout,
  logoSrc = "/images/rukn-logo.png",
  title = "Rukn Elwatikon Center - Accountant Portal",
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { language, toggleLanguage } = useAccountantLanguage()

  const isRTL = language === "ar"

  return (
    <header className={`${styles.header} ${isRTL ? styles.rtl : styles.ltr}`}>
      <CustomLink href="/accountantportal" className={styles.logoContainer}>
        <img src={logoSrc || "/placeholder.svg"} className={styles.logo} alt="Rukn Elwatikon Center Logo" />
      </CustomLink>

      <div className={styles.titleContainer}>
        <h4 className={styles.title}>{language === "ar" ? "مركز ركن الواثقون المالي - بوابة المحاسب" : title}</h4>
      </div>

      <div className={styles.userSection}>
        {/* Language Switcher */}
        <button className={styles.languageButton} onClick={toggleLanguage}>
          <Globe size={18} />
          <span>{language === "en" ? "العربية" : "English"}</span>
        </button>

        {!loading && user && user.role === "accountant" ? (
          <div className={styles.dropdown}>
            <button className={styles.dropdownButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span className={styles.accountantInfo}>
                <span className={styles.accountantName}> {language === "ar" ? "مرحبا :" : "Welcome :"} {user.name}</span>
                <span className={styles.accountantRole}>
                  {language === "ar" ? "محاسب مالي" : "Financial Accountant"}
                </span>
              </span>
              <ChevronDown className={styles.chevronIcon} />
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <CustomLink
                  href="/accountant-dashboard"
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  {language === "ar" ? "لوحة القيادة" : "Dashboard"}
                </CustomLink>
                <CustomLink href="/accountant-profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  {language === "ar" ? "إعدادات الملف الشخصي" : "Profile Settings"}
                </CustomLink>
                <CustomLink href="/financial-reports" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                  {language === "ar" ? "التقارير المالية" : "Financial Reports"}
                </CustomLink>
                <hr className={styles.dropdownDivider} />
                <button
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={() => {
                    setDropdownOpen(false)
                    onLogout()
                  }}
                >
                  {language === "ar" ? "تسجيل الخروج" : "Sign Out"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.loginButton} onClick={onLoginClick}>
            {language === "ar" ? "دخول" : "Login"}
          </button>
        )}
      </div>
    </header>
  )
}
