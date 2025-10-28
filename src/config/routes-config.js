import { isStaffSubdomain } from "@/utils/subdomain-utils"
import { DOMAIN_ROUTES } from "@/config/domain-routes"

// Role-based access control configuration
// Defines which routes each role can access and where to redirect unauthorized users

export const ROUTES_CONFIG = {
  // Public routes - accessible without authentication
  public: ["/sign-in", "/clientportal", "/clientportal/forgot-password", "/clientportal/reset-password"],

  // Admin role - full access to management features
  admin: [
    "/",
    "/full-program",
    "/single-session",
    "/school",
    "/Admin-Book-Appointment",
    "/calendar-main",
    "/full-program-appointments",
    "/appointments/add-appointments",
    "/appointments", // Dynamic route base
    "/student/list",
    "/student/add",
    "/student/edit", // Dynamic route base
    "/student/view", // Dynamic route base
    "/doctor/list",
    "/doctor/add",
    "/doctor/edit", // Dynamic route base
    "/accountant/list",
    "/accountant/add",
    "/accountant/edit", // Dynamic route base
    "/Payment-Transactions",
    "/checks",
    "/drive-link",
    "/accountantportal/cash-payments",
    "/accountantportal/bank-transfer-payments",
  ],

  // HeadDoctor role - similar to admin but without accountant management
  HeadDoctor: [
    "/",
    "/full-program",
    "/single-session",
    "/school",
    "/Admin-Book-Appointment",
    "/calendar-main",
    "/full-program-appointments",
    "/appointments/add-appointments",
    "/appointments", // Dynamic route base
    "/student/list",
    "/student/add",
    "/student/edit", // Dynamic route base
    "/doctor/list",
    "/doctor/add",
    "/doctor/edit", // Dynamic route base
    "/drive-link",
    "/accountantportal/cash-payments",
    "/accountantportal/bank-transfer-payments",
  ],

  // Doctor role - access to medical programs and calendar
  doctor: [
    "/full-program",
    "/single-session",
    "/school",
    "/doctorportal",
    "/doctorportal/profile-doctor",
    "/calendar-main",
  ],

  // Accountant role - access to financial management
  accountant: [
    "/accountantportal",
    "/accountantportal/Payment-Transactions",
    "/accountantportal/checks",
    "/accountantportal/full-program-payment",
    "/accountantportal/profile-accountant",
    "/accountantportal/cash-payments",
  ],

  // Patient role - access to booking and personal information
  patient: [
    "/clientportal",
    "/Book-Appointment",
    "/profile",
    "/financial-records",
    "/student-calendar",
    "/clientportal/forgot-password",
    "/clientportal/reset-password",
  ],
}

export const STAFF_ROUTES = DOMAIN_ROUTES.staff
export const CLIENT_ROUTES = DOMAIN_ROUTES.client

// Redirect destinations for unauthorized access
export const REDIRECT_CONFIG = {
  unauthenticated: "/error", // Non-logged users trying to access protected routes
  admin: "/", // Admin trying to access unauthorized routes
  HeadDoctor: "/", // HeadDoctor trying to access unauthorized routes
  doctor: "/doctorportal", // Doctor trying to access unauthorized routes
  accountant: "/accountantportal", // Accountant trying to access unauthorized routes
  patient: "/clientportal", // Patient trying to access unauthorized routes
}

// Routes that should redirect logged-in users
export const LOGIN_ROUTES = ["/sign-in"]

// Dashboard routes for each role (where to redirect after login)
export const DASHBOARD_ROUTES = {
  admin: "/",
  HeadDoctor: "/",
  doctor: "/doctorportal",
  accountant: "/accountantportal",
  patient: "/clientportal",
}

/**
 * Check if a route is allowed for a specific role on current domain
 * @param {string} pathname - Current route pathname
 * @param {string} role - User role
 * @returns {boolean} - Whether the route is allowed
 */
export function isRouteAllowed(pathname, role) {
  const onStaffSubdomain = isStaffSubdomain()

  // On staff subdomain: /sign-in is public
  if (onStaffSubdomain && pathname === "/sign-in") {
    return true
  }

  // On main domain: /clientportal and password routes are public
  if (
    !onStaffSubdomain &&
    (pathname === "/clientportal" ||
      pathname === "/clientportal/forgot-password" ||
      pathname === "/clientportal/reset-password")
  ) {
    return true
  }

  // If no role (unauthenticated), only public routes allowed
  if (!role) {
    return false
  }

  if (onStaffSubdomain && CLIENT_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return false
  }

  if (!onStaffSubdomain && STAFF_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return false
  }

  if (onStaffSubdomain && role === "patient") {
    return false
  }

  const staffRoles = ["admin", "HeadDoctor", "doctor", "accountant"]
  if (!onStaffSubdomain && staffRoles.includes(role)) {
    return false
  }

  const allowedRoutes = ROUTES_CONFIG[role] || []

  // Exact match
  if (allowedRoutes.includes(pathname)) {
    return true
  }

  // Check for dynamic routes (e.g., /appointments/123, /student/edit/456)
  return allowedRoutes.some((route) => {
    if (pathname.startsWith(route + "/")) {
      return true
    }
    return false
  })
}

/**
 * Get redirect destination for unauthorized access
 * @param {string} role - User role (or null if unauthenticated)
 * @returns {string} - Redirect path
 */
export function getRedirectPath(role) {
  if (!role) {
    return REDIRECT_CONFIG.unauthenticated
  }
  return REDIRECT_CONFIG[role] || "/error"
}

/**
 * Check if route is a login route
 * @param {string} pathname - Current route pathname
 * @returns {boolean} - Whether the route is a login route
 */
export function isLoginRoute(pathname) {
  return LOGIN_ROUTES.includes(pathname)
}

/**
 * Get dashboard route for a role
 * @param {string} role - User role
 * @returns {string} - Dashboard path
 */
export function getDashboardRoute(role) {
  return DASHBOARD_ROUTES[role] || "/"
}
