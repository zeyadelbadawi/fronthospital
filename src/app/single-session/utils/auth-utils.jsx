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
  if (typeof window === "undefined") return false

  const token = localStorage.getItem("token")
  if (!token) return false

  const decoded = decodeJWT(token)
  if (!decoded) return false

  const currentTime = Date.now() / 1000
  if (decoded.exp < currentTime) {
    localStorage.removeItem("token")
    return false
  }

  return true
}

// Get current user info from token
export const getCurrentUser = () => {
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

// Get current user ID
export const getCurrentUserId = () => {
  const user = getCurrentUser()
  return user ? user.id : null
}

// Check if current user is admin
export const isAdmin = () => {
  const role = getCurrentUserRole()
  return role === "admin"
}

// Check if current user is head doctor
export const isHeadDoctor = () => {
  const role = getCurrentUserRole()
  return role === "head_doctor"
}

// Check if current user is admin or head doctor
export const isAdminOrHeadDoctor = () => {
  const role = getCurrentUserRole()
  return role === "admin" || role === "head_doctor"
}

// Check if current user has access to school sections (admin or doctor)
export const hasSchoolAccess = () => {
  const role = getCurrentUserRole()
  return role === "admin" || role === "doctor" || role === "head_doctor"
}

// Check if current user is doctor
export const isDoctor = () => {
  const role = getCurrentUserRole()
  return role === "doctor"
}

// Check if current user is patient
export const isPatient = () => {
  const role = getCurrentUserRole()
  return role === "patient"
}

// Check if current user is accountant
export const isAccountant = () => {
  const role = getCurrentUserRole()
  return role === "accountant"
}

// Check if current user is student
export const isStudent = () => {
  const role = getCurrentUserRole()
  return role === "student"
}

// Logout function
export const logout = () => {
  if (typeof window === "undefined") return

  localStorage.removeItem("token")
  window.location.href = "/sign-in"
}

// Get token
export const getToken = () => {
  if (typeof window === "undefined") return null

  return localStorage.getItem("token")
}
