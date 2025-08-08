"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AccountantHeader from "../../../components/accountant-header"
import PublicProfileAccountant from "../../../components/PublicProfileAccountant"
import { useAccountantLanguage } from "../../../contexts/accountant-language-context"

const ProfileAccountantPage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { language } = useAccountantLanguage()

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    
    
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData)
        
        if (parsedUser.role === "accountant") {
          setUser(parsedUser)
          setLoading(false)
        } else {
          router.push("/accountantportal")
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        router.push("/accountantportal")
      }
    } else {
      router.push("/accountantportal")
    }
  }, [router])

  const handleLoginClick = () => {
    router.push("/accountantportal")
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/accountantportal")
  }

  // Don't render anything while loading
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px",
        color: "#666"
      }}>
        <div>{language === "ar" ? "جاري التحميل..." : "Loading..."}</div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <>
      <AccountantHeader 
        user={user} 
        loading={false} 
        onLoginClick={handleLoginClick} 
        onLogout={handleLogout} 
      />
      <PublicProfileAccountant />
    </>
  )
}

export default ProfileAccountantPage
