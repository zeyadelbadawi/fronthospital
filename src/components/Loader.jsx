import styles from "@/styles/loader.module.css"

export default function Loader({
  text = "Loading...",
  size = "default",
  variant = "default",
  inline = false,
  fullScreen = false,
}) {
  const getLoaderClasses = () => {
    const classes = [styles.loaderContainer]

    if (size === "small") classes.push(styles.smallLoader)
    if (inline) classes.push(styles.inlineLoader)
    if (fullScreen) classes.push(styles.fullScreenLoader)
    if (variant === "success") classes.push(styles.successLoader)
    if (variant === "warning") classes.push(styles.warningLoader)
    if (variant === "danger") classes.push(styles.dangerLoader)

    return classes.join(" ")
  }

  return (
    <div className={getLoaderClasses()}>
      <div className={styles.modernLoader}></div>
      {text && <span className={styles.loadingText}>{text}</span>}
    </div>
  )
}
