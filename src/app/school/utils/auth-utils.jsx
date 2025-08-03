// JWT decoding utility (simple base64 decode)
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error decoding JWT:", error)
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  // Check if we're in the browser
  if (typeof window === "undefined") return false

  const token = localStorage.getItem("token")
  if (!token) return false

  const decoded = decodeJWT(token)
  if (!decoded) return false

  // Check if token is expired
  const currentTime = Date.now() / 1000
  if (decoded.exp < currentTime) {
    localStorage.removeItem("token")
    return false
  }

  return true
}

// Get current user info from token
export const getCurrentUser = () => {
  // Check if we're in the browser
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("token")
  if (!token) return null

  const decoded = decodeJWT(token)
  if (!decoded) return null

  return {
    id: decoded.id,
    role: decoded.role,
    exp: decoded.exp,
    iat: decoded.iat,
  }
}

// Get current user role
export const getCurrentUserRole = () => {
  const user = getCurrentUser()
  return user ? user.role : null
}

// Check if current user has access to school (admin or doctor only)
export const hasSchoolAccess = () => {
  const role = getCurrentUserRole()
  return role === "admin" || role === "doctor"
}

// Check if current user is admin
export const isAdmin = () => {
  const role = getCurrentUserRole()
  return role === "admin"
}

// Check if current user is doctor
export const isDoctor = () => {
  const role = getCurrentUserRole()
  return role === "doctor"
}

// Logout function
export const logout = () => {
  // Check if we're in the browser
  if (typeof window === "undefined") return

  localStorage.removeItem("token")
  window.location.href = "/sign-in"
}
