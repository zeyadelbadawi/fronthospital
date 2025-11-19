"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import styles from "../styles/full-program-loading-progress.module.css"

export function FullProgramLoadingProgress({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  useEffect(() => {
    const steps = [
      { step: "Initializing Comprehensive Healthcare System...", duration: 350, progress: 12 },
      { step: "Verifying Medical Professional Access...", duration: 400, progress: 25 },
      { step: "Loading Student Management Database...", duration: 450, progress: 40 },
      { step: "Preparing ABA Therapy Protocols...", duration: 380, progress: 55 },
      { step: "Loading Speech Therapy Assessment Tools...", duration: 420, progress: 68 },
      { step: "Initializing Occupational Therapy Modules...", duration: 360, progress: 78 },
      { step: "Setting up Physical Therapy Programs...", duration: 340, progress: 88 },
      { step: "Finalizing Medical Dashboard Interface...", duration: 280, progress: 96 },
      { step: "Healthcare System Ready for Professionals", duration: 200, progress: 100 },
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
          setTimeout(runStep, 120)
        }
      }

      requestAnimationFrame(animateProgress)
    }

    setTimeout(runStep, 250)
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
              width={220}
              height={220}
              className={styles.logo}
              priority
            />
          </div>
          <h1 className={styles.title}>Full Program Healthcare System</h1>
          <p className={styles.subtitle}>Comprehensive Rehabilitation Management</p>
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
              <span className={styles.progressLabel}>Initializing</span>
            </div>
          </div>

          {/* Status Section */}
          <div className={styles.statusContainer}>
            <div className={styles.statusText}>{currentStep}</div>
            <div className={styles.statusIndicator}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          </div>
        </div>

        {/* Therapy Modules */}
        <div className={styles.therapyModules}>
          <div className={styles.moduleItem}>
            <div className={styles.moduleIcon}>
              <span>🧠</span>
            </div>
            <span>ABA Therapy</span>
          </div>
          <div className={styles.moduleItem}>
            <div className={styles.moduleIcon}>
              <span>🗣️</span>
            </div>
            <span>Speech Therapy</span>
          </div>
          <div className={styles.moduleItem}>
            <div className={styles.moduleIcon}>
              <span>🤲</span>
            </div>
            <span>Occupational</span>
          </div>
          <div className={styles.moduleItem}>
            <div className={styles.moduleIcon}>
              <span>🏃</span>
            </div>
            <span>Physical</span>
          </div>
        </div>

        {/* Background Elements */}
        <div className={styles.backgroundElements}>
          <div className={styles.medicalPattern}></div>
          <div className={styles.floatingShape1}></div>
          <div className={styles.floatingShape2}></div>
          <div className={styles.floatingShape3}></div>
        </div>
      </div>
    </div>
  )
}
