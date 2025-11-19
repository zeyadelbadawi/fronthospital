// OPTIMIZED Authentication utilities with caching and improved JWT decoding

// Cache for authentication results
const authCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const JWT_CACHE = new Map()

// OPTIMIZED: Simplified and faster JWT decoding
const decodeJWTOptimized = (token) => {
  // Check cache first
  if (JWT_CACHE.has(token)) {
    const cached = JWT_CACHE.get(token)
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    JWT_CACHE.delete(token)
  }

  try {
    // OPTIMIZED: Simplified decoding without complex string manipulation
    const base64Url = token.split(".")[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = atob(base64)
    const decoded = JSON.parse(jsonPayload)

    // Cache the result
    JWT_CACHE.set(token, {
      data: decoded,
      timestamp: Date.now(),
    })

    return decoded
  } catch (error) {
    console.error("Error decoding JWT:", error)
    return null
  }
}

// OPTIMIZED: Cached authentication check
export const isAuthenticatedOptimized = () => {
  if (typeof window === "undefined") return false

  const cacheKey = "auth_check"
  const cached = authCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result
  }

  try {
    const token = localStorage.getItem("token")
    if (!token) {
      authCache.set(cacheKey, { result: false, timestamp: Date.now() })
      return false
    }

    const decoded = decodeJWTOptimized(token)
    if (!decoded) {
      authCache.set(cacheKey, { result: false, timestamp: Date.now() })
      return false
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    const isValid = decoded.exp && decoded.exp > now

    authCache.set(cacheKey, { result: isValid, timestamp: Date.now() })
    return isValid
  } catch (error) {
    console.error("Error checking authentication:", error)
    authCache.set(cacheKey, { result: false, timestamp: Date.now() })
    return false
  }
}

// OPTIMIZED: Cached user data retrieval
export const getCurrentUserOptimized = () => {
  if (typeof window === "undefined") return null

  const cacheKey = "current_user"
  const cached = authCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result
  }

  try {
    const token = localStorage.getItem("token")
    if (!token) {
      authCache.set(cacheKey, { result: null, timestamp: Date.now() })
      return null
    }

    const decoded = decodeJWTOptimized(token)
    if (!decoded) {
      authCache.set(cacheKey, { result: null, timestamp: Date.now() })
      return null
    }

    const userData = {
      id: decoded.id || decoded.userId || decoded._id,
      name: decoded.name || decoded.username,
      email: decoded.email,
      role: decoded.role || decoded.userType,
      department: decoded.department || decoded.assignedDepartment,
    }

    authCache.set(cacheKey, { result: userData, timestamp: Date.now() })
    return userData
  } catch (error) {
    console.error("Error getting current user:", error)
    authCache.set(cacheKey, { result: null, timestamp: Date.now() })
    return null
  }
}

// OPTIMIZED: Cached school access check
export const hasSchoolAccessOptimized = () => {
  if (typeof window === "undefined") return false

  const cacheKey = "school_access"
  const cached = authCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result
  }

  const user = getCurrentUserOptimized()
  const hasAccess = user && (user.role === "admin" || user.role === "doctor")

  authCache.set(cacheKey, { result: hasAccess, timestamp: Date.now() })
  return hasAccess
}

// OPTIMIZED: Logout with cache clearing
export const logoutOptimized = () => {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    // Clear all caches
    authCache.clear()
    JWT_CACHE.clear()

    // Redirect to login
    window.location.href = "/login"
  } catch (error) {
    console.error("Error during logout:", error)
  }
}

// Clear cache manually if needed
export const clearAuthCache = () => {
  authCache.clear()
  JWT_CACHE.clear()
}

// Backward compatibility exports
export const isAuthenticated = isAuthenticatedOptimized
export const getCurrentUser = getCurrentUserOptimized
export const hasSchoolAccess = hasSchoolAccessOptimized
export const logout = logoutOptimized
