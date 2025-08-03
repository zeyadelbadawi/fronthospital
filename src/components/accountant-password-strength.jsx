import styles from "../styles/AccountantPortal.module.css"
import { useAccountantLanguage } from "../contexts/accountant-language-context"

export default function AccountantPasswordStrength({ strength }) {
  const { language } = useAccountantLanguage()

  const getStrengthText = () => {
    if (language === "ar") {
      switch (strength) {
        case 0:
        case 1:
          return "ضعيف جداً"
        case 2:
          return "ضعيف"
        case 3:
          return "متوسط"
        case 4:
          return "جيد"
        case 5:
          return "قوي"
        default:
          return "ضعيف جداً"
      }
    } else {
      switch (strength) {
        case 0:
        case 1:
          return "Very Weak"
        case 2:
          return "Weak"
        case 3:
          return "Fair"
        case 4:
          return "Good"
        case 5:
          return "Strong"
        default:
          return "Very Weak"
      }
    }
  }

  const getStrengthClass = () => {
    switch (strength) {
      case 0:
      case 1:
        return styles.strengthWeak
      case 2:
        return styles.strengthWeak
      case 3:
        return styles.strengthFair
      case 4:
        return styles.strengthGood
      case 5:
        return styles.strengthStrong
      default:
        return styles.strengthWeak
    }
  }

  return (
    <div className={styles.passwordStrength}>
      <div className={styles.strengthBar}>
        <div
          className={`${styles.strengthFill} ${getStrengthClass()}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        ></div>
      </div>
      <div className={`${styles.strengthText} ${getStrengthClass()}`}>
        {language === "ar" ? "قوة كلمة المرور: " : "Password Strength: "}
        {getStrengthText()}
      </div>
    </div>
  )
}
