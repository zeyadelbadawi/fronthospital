import styles from "../styles/ClientPortal.module.css"

export default function PasswordStrength({ strength }) {
  const getStrengthText = () => {
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
        <div className={`${styles.strengthFill} ${getStrengthClass()}`}></div>
      </div>
      <div className={styles.strengthText}>Password Strength: {getStrengthText()}</div>
    </div>
  )
}
