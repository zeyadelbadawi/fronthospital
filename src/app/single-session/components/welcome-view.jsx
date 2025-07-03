"use client"

import { Activity, Brain, Hand, GraduationCap, MessageSquare } from 'lucide-react'
import styles from "../styles/welcome.module.css"

export function WelcomeView() {
  const departments = [
    {
      icon: Activity,
      title: "Physical Therapy",
      description: "Manage physical therapy appointments and student treatment schedules",
      color: "blue",
    },
    {
      icon: Brain,
      title: "ABA Therapy",
      description: "Applied Behavior Analysis appointment scheduling and student progress management",
      color: "purple",
    },
    {
      icon: Hand,
      title: "Occupational Therapy",
      description: "Occupational therapy session management and student appointment coordination",
      color: "green",
    },
    {
      icon: GraduationCap,
      title: "Special Education",
      description: "Special education program appointments and student evaluation scheduling",
      color: "orange",
    },
    {
      icon: MessageSquare,
      title: "Speech Therapy",
      description: "Speech and language therapy appointments and student assessment scheduling",
      color: "red",
    },
  ]

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeContent}>
        {/* Header Section */}
        <div className={styles.welcomeHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.welcomeTitle}>Doctor Dashboard</h1>
            <p className={styles.welcomeSubtitle}>
              Comprehensive appointment management system for healthcare Doctors and professionals
            </p>
            <div className={styles.roleIndicator}>
              <span className={styles.roleText}>Healthcare Doctor Portal</span>
            </div>
          </div>
        </div>

        {/* Departments Grid */}
        <div className={styles.departmentsSection}>
          <h2 className={styles.sectionTitle}>Department Management</h2>
          <p className={styles.sectionSubtitle}>
            Select a department from the sidebar to view and manage student appointments
          </p>

          <div className={styles.cardsGrid}>
            {departments.map((dept, index) => (
              <div key={index} className={`${styles.departmentCard} ${styles[dept.color]}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIconWrapper}>
                    <dept.icon className={styles.cardIcon} />
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{dept.title}</h3>
                  <p className={styles.cardDescription}>{dept.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      
      </div>
    </div>
  )
}
