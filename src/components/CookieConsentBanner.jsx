"use client"
import { useCookieConsent } from "@/contexts/CookieConsentContext"
import { usePathname } from "next/navigation"
import { Cookie, X } from "lucide-react"
import styles from "@/styles/CookieConsent.module.css"
import { useContext } from "react"
import { LanguageContext } from "@/contexts/LanguageContext"
import { DoctorLanguageContext } from "@/contexts/doctor-language-context"
import { AccountantLanguageContext } from "@/contexts/accountant-language-context"

const CookieConsentBanner = () => {
  const pathname = usePathname()
  const { showBanner, acceptCookies, declineCookies } = useCookieConsent()

  const doctorContext = useContext(DoctorLanguageContext)
  const accountantContext = useContext(AccountantLanguageContext)
  const patientContext = useContext(LanguageContext)

  // Determine which language context to use based on the current route
  let language = "ar" // Default to Arabic
  let translations = null

  if (pathname?.startsWith("/doctorportal") && doctorContext) {
    language = doctorContext.language || "en"
    translations = doctorContext.translations
  } else if (pathname?.startsWith("/accountantportal") && accountantContext) {
    language = accountantContext.language || "ar"
    translations = accountantContext.translations[language]
  } else if (patientContext) {
    language = patientContext.language || "ar"
    translations = patientContext.translations[language]
  }

  // Fallback translations if context is not available
  const fallbackTranslations = {
    en: {
      title: "We use cookies",
      message:
        "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking 'Accept All', you consent to our use of cookies.",
      accept: "Accept All",
      decline: "Decline",
      learnMore: "Learn More",
    },
    ar: {
      title: "نستخدم ملفات تعريف الارتباط",
      message:
        "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح الخاصة بك، وتقديم محتوى مخصص، وتحليل حركة المرور لدينا. بالنقر على 'قبول الكل'، فإنك توافق على استخدامنا لملفات تعريف الارتباط.",
      accept: "قبول الكل",
      decline: "رفض",
      learnMore: "معرفة المزيد",
    },
  }

  const t = translations?.cookies || fallbackTranslations[language] || fallbackTranslations.ar
  const isRTL = language === "ar"

  if (!showBanner) return null

  return (
    <div className={`${styles.overlay} ${isRTL ? styles.rtl : styles.ltr}`}>
      <div className={styles.banner}>
        <button className={styles.closeButton} onClick={declineCookies} aria-label="Close">
          <X size={20} />
        </button>

        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <Cookie className={styles.icon} size={32} />
          </div>

          <div className={styles.textContent}>
            <h3 className={styles.title}>{t.title}</h3>
            <p className={styles.message}>{t.message}</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.acceptButton} onClick={acceptCookies}>
              {t.accept}
            </button>
            <button className={styles.declineButton} onClick={declineCookies}>
              {t.decline}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookieConsentBanner
