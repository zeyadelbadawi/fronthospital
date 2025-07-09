import { isAuthenticated, getCurrentUserRole } from "../utils/auth-utils"

const AccessControl = ({ allowedRoles, children, fallback = null }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return fallback || <div className="text-red-500">Please log in to access this content.</div>
  }

  // Get current user role
  const userRole = getCurrentUserRole()

  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return fallback || <div className="text-red-500">You don't have permission to access this content.</div>
  }

  return children
}

export default AccessControl
