"use client"
import { createContext, useContext, useState } from "react"

const DoctorLanguageContext = createContext()

export const useDoctorLanguage = () => {
  const context = useContext(DoctorLanguageContext)
  if (!context) {
    throw new Error("useDoctorLanguage must be used within a DoctorLanguageProvider")
  }
  return context
}

const translations = {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
  },
  welcome: {
    title: "Welcome to Doctor Portal",
    subtitle:
      "Manage your patients, create treatment plans, and provide comprehensive healthcare services with our advanced medical platform",
  },
  guidelines: {
    title: "Medical Practice Guidelines",
    lines: [
      "MAINTAIN PATIENT CONFIDENTIALITY at all times in accordance with HIPAA regulations.",
      "DOCUMENT ALL PATIENT INTERACTIONS thoroughly and accurately in the system.",
      "FOLLOW EVIDENCE-BASED TREATMENT PROTOCOLS for optimal patient outcomes.",
      "ENSURE INFORMED CONSENT is obtained before any treatment or procedure.",
      "REPORT ANY ADVERSE EVENTS or complications immediately to the medical director.",
      "MAINTAIN PROFESSIONAL BOUNDARIES and ethical standards in all patient interactions.",
      "KEEP YOUR MEDICAL LICENSE and certifications current and up-to-date.",
      "USE SECURE COMMUNICATION CHANNELS for all patient-related discussions.",
    ],
  },
  services: {
    fullProgram: {
      title: "Full Program",
      description: "Manage comprehensive patient treatment programs and create detailed long-term care plans",
    },
    singleSession: {
      title: "Single Session",
      description: "Handle individual patient consultations and single session appointments efficiently",
    },
    schoolProgram: {
      title: "School Program",
      description: "Manage educational evaluations and school-related assessments for students",
    },
    myProfile: {
      title: "My Profile",
      description: "Manage your professional profile, availability, and department assignments",
    },
  },
  auth: {
    welcomeBack: "Welcome Back, Doctor",
    createAccount: "Create Doctor Account",
    email: "Email Address",
    password: "Password",
    username: "Username",
    phone: "Phone Number",
    title: "Professional Title",
    confirmPassword: "Confirm Password",
    emailPlaceholder: "Enter your professional email",
    passwordPlaceholder: "Enter your password",
    usernamePlaceholder: "Enter your username",
    phonePlaceholder: "Enter your phone number",
    titlePlaceholder: "e.g., Dr., Prof., MD",
    createPasswordPlaceholder: "Create a secure password",
    confirmPasswordPlaceholder: "Confirm your password",
    availability: "Availability Status",
    selectAvailability: "Select availability",
    available: "Available",
    notAvailable: "Not Available",
    departments: "Departments",
    selectDepartments: "Select your departments",
    rememberMe: "Remember me for 30 days",
    signIn: "Sign In",
    signingIn: "Signing In...",
    creatingAccount: "Creating Account...",
    noAccount: "Don't have an account? Register here",
    haveAccount: "Already have an account? Sign in here",
  },
  validation: {
    invalidEmail: "Please enter a valid email address",
    passwordTooShort: "Password must be at least 6 characters",
    invalidUsername: "Username must be at least 3 characters",
    invalidPhone: "Please enter a valid phone number",
    weakPassword: "Password must be at least 8 characters with uppercase, lowercase, and number",
    passwordMismatch: "Passwords do not match",
    validEmail: "Valid email address",
    validUsername: "Valid username",
    validPhone: "Valid phone number",
    passwordsMatch: "Passwords match",
  },
  messages: {
    logoutSuccess: "Logged out successfully",
    loginSuccess: "Welcome back! Login successful",
    loginFailed: "Login failed. Please check your credentials",
    signupSuccess: "Registration successful! Please log in with your credentials",
    signupFailed: "Registration failed. Please try again",
    fixErrors: "Please fix the errors before submitting",
    selectAvailability: "Please select your availability status",
    selectDepartments: "Please select at least one department",
  },
}

export const DoctorLanguageProvider = ({ children }) => {
  const [language] = useState("en") // Always English for doctors

  return (
    <DoctorLanguageContext.Provider
      value={{
        language,
        translations,
      }}
    >
      {children}
    </DoctorLanguageContext.Provider>
  )
}
