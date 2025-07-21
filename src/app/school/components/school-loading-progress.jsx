"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import styles from "../styles/school-loading-progress.module.css"

export function SchoolLoadingProgress({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  useEffect(() => {
    const steps = [
      { step: "Initializing School Evaluation System...", duration: 300, progress: 15 },
      { step: "Verifying Medical Credentials...", duration: 400, progress: 30 },
      { step: "Loading Patient Database...", duration: 350, progress: 45 },
      { step: "Preparing Assessment Tools...", duration: 500, progress: 65 },
      { step: "Loading Educational Protocols...", duration: 400, progress: 80 },
      { step: "Finalizing Medical Interface...", duration: 300, progress: 95 },
      { step: "System Ready for Healthcare Professionals", duration: 200, progress: 100 },
    ]

    let currentStepIndex = 0
    let currentProgress = 0

    const runStep = () => {
      if (currentStepIndex >= steps.length) {
        setTimeout(() => onComplete(), 500)
        return
      }

      const step = steps[currentStepIndex]
      setCurrentStep(step.step)

      const startProgress = currentProgress
      const targetProgress = step.progress
      const duration = step.duration
      const startTime = Date.now()

      const animateProgress = () => {
        const elapsed = Date.now() - startTime
        const progressRatio = Math.min(elapsed / duration, 1)

        const easeOutCubic = 1 - Math.pow(1 - progressRatio, 3)
        const newProgress = startProgress + (targetProgress - startProgress) * easeOutCubic

        setProgress(Math.round(newProgress))

        if (progressRatio < 1) {
          requestAnimationFrame(animateProgress)
        } else {
          currentProgress = targetProgress
          currentStepIndex++
          setTimeout(runStep, 100)
        }
      }

      requestAnimationFrame(animateProgress)
    }

    setTimeout(runStep, 200)
  }, [onComplete])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo Section */}
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <Image
              src="/images/rukn-logo.png"
              alt="Rukn Alwatikon Center"
              width={200}
              height={200}
              className={styles.logo}
              priority
            />
          </div>
          <h1 className={styles.title}>School Evaluation System</h1>
          <p className={styles.subtitle}>Healthcare Professional Dashboard</p>
        </div>

        {/* Progress Section */}
        <div className={styles.progressSection}>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}>
                <div className={styles.progressShine}></div>
              </div>
            </div>
            <div className={styles.progressInfo}>
              <span className={styles.progressText}>{progress}%</span>
              <span className={styles.progressLabel}>Loading</span>
            </div>
          </div>

          {/* Status Section */}
          <div className={styles.statusContainer}>
            <div className={styles.statusText}>{currentStep}</div>
            <div className={styles.statusIndicator}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          </div>
        </div>

        {/* Medical Icons */}
        <div className={styles.medicalIcons}>
          <div className={styles.iconItem}>
            <div className={styles.iconCircle}>
              <span>📋</span>
            </div>
            <span>Assessment</span>
          </div>
          <div className={styles.iconItem}>
            <div className={styles.iconCircle}>
              <span>🧠</span>
            </div>
            <span>Cognitive</span>
          </div>
          <div className={styles.iconItem}>
            <div className={styles.iconCircle}>
              <span>📊</span>
            </div>
            <span>Analytics</span>
          </div>
          <div className={styles.iconItem}>
            <div className={styles.iconCircle}>
              <span>👨‍⚕️</span>
            </div>
            <span>Medical</span>
          </div>
        </div>

        {/* Background Elements */}
        <div className={styles.backgroundElements}>
          <div className={styles.gridPattern}></div>
          <div className={styles.floatingElement1}></div>
          <div className={styles.floatingElement2}></div>
          <div className={styles.floatingElement3}></div>
        </div>
      </div>
    </div>
  )
}
