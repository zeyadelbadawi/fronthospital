import styles from "../styles/utility-components.module.css"

export default function Loader({ text = "Loading..." }) {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.modernLoader}></div>
      <span className={styles.loadingText}>{text}</span>
    </div>
  )
}
