/**
 * Unified logout function for both patient and staff users
 * Clears cookies (backend) and localStorage (frontend)
 */
export async function logout() {
    try {
      // Get CSRF token if available
      const csrfToken = document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ""
  
      // Call backend logout to blacklist tokens and clear cookies
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/authentication/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      })
  
      const result = await response.json()
      console.log("  Logout response:", result)
    } catch (error) {
      console.error("  Logout error:", error)
    } finally {
      // Always clear localStorage regardless of backend response
      localStorage.removeItem("token")
  
      // Clear any other auth-related data
      const authKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes("lockout_") || key.includes("auth_"))) {
          authKeys.push(key)
        }
      }
      authKeys.forEach((key) => localStorage.removeItem(key))
  
      // Redirect to appropriate login page
      const isStaff = window.location.hostname.startsWith("stuff.")
      if (isStaff) {
        window.location.href = "/sign-in"
      } else {
        window.location.href = "/clientportal"
      }
    }
  }
  