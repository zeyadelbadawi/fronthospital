"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/helper/axiosSetup"
import Loader from "@/components/Loader"

export default function AppointmentAccessControl({ children }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/error")
          return
        }

        const response = await axiosInstance.get("/authentication/profile")
        const user = response.data

        const allowedRoles = ["admin", "HeadDoctor"]
        if (allowedRoles.includes(user.role)) {
          setIsAuthorized(true)
        } else {
          router.push("/error")
        }
      } catch (error) {
        console.error("Access control error:", error)
        router.push("/error")
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [router])

  if (loading) {
    return <Loader text="Verifying access..." />
  }

  if (!isAuthorized) {
    return null
  }

  return children
}
