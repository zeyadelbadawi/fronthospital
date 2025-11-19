/**
 * Subdomain Detection and Domain Management Utilities
 * Handles detection of current domain context and provides helper functions
 * for subdomain-based routing logic
 */

/**
 * Get the current subdomain from the hostname
 * Supports both development (localhost:3000) and production (yourdomain.com) formats
 * @returns {string|null} - The subdomain name or null if on main domain
 */
export function getSubdomain() {
  if (typeof window === "undefined") {
    return null
  }

  const hostname = window.location.hostname

  // Check if hostname starts with "stuff."
  if (hostname.startsWith("stuff.")) {
    return "stuff"
  }

  // Development: localhost or 127.0.0.1 (no subdomain)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null
  }

  // Production: Parse subdomain from hostname
  const parts = hostname.split(".")
  if (parts.length > 2) {
    return parts[0] // Return the subdomain (e.g., "stuff")
  }

  return null
}

/**
 * Check if currently on the staff subdomain
 * @returns {boolean} - True if on stuff.localhost or stuff.yourdomain.com
 */
export function isStaffSubdomain() {
  const subdomain = getSubdomain()
  return subdomain === "stuff"
}

/**
 * Check if currently on the main domain
 * @returns {boolean} - True if on localhost:3000 or yourdomain.com
 */
export function isMainDomain() {
  return !isStaffSubdomain()
}

/**
 * Get the correct domain URL for a given role
 * @param {string} role - User role (admin, doctor, accountant, patient, etc.)
 * @returns {string} - The correct domain URL for this role
 */
export function getCorrectDomainForRole(role) {
  if (typeof window === "undefined") {
    return "/"
  }

  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = window.location.port ? `:${window.location.port}` : ""

  // Staff roles should be on stuff subdomain
  const staffRoles = ["admin", "HeadDoctor", "doctor", "accountant"]
  if (staffRoles.includes(role)) {
    // Check if already on stuff subdomain
    if (isStaffSubdomain()) {
      return `${protocol}//${hostname}${port}`
    }
    // Redirect to stuff subdomain
    return `${protocol}//stuff.${hostname}${port}`
  }

  // Patient role should be on main domain
  if (role === "patient") {
    // Check if on staff subdomain
    if (isStaffSubdomain()) {
      // Remove "stuff." from hostname
      const mainHostname = hostname.replace(/^stuff\./, "")
      return `${protocol}//${mainHostname}${port}`
    }
    return `${protocol}//${hostname}${port}`
  }

  return `${protocol}//${hostname}${port}`
}

/**
 * Redirect user to correct domain based on their role
 * @param {string} role - User role
 * @param {string} pathname - Optional path to redirect to
 */
export function redirectToCorrectDomain(role, pathname = "/") {
  if (typeof window === "undefined") {
    return
  }

  const correctDomain = getCorrectDomainForRole(role)
  const targetUrl = `${correctDomain}${pathname}`

  // Only redirect if not already on correct domain
  const currentUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ""}`
  if (currentUrl !== correctDomain) {
    window.location.href = targetUrl
  }
}

/**
 * Get error page URL for current domain
 * @returns {string} - Error page URL
 */
export function getErrorPageUrl() {
  if (typeof window === "undefined") {
    return "/error"
  }

  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = window.location.port ? `:${window.location.port}` : ""

  return `${protocol}//${hostname}${port}/error`
}

/**
 * Get sign-in page URL (only on staff subdomain)
 * @returns {string} - Sign-in page URL
 */
export function getSignInUrl() {
  if (typeof window === "undefined") {
    return "/sign-in"
  }

  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = window.location.port ? `:${window.location.port}` : ""

  // Always redirect to stuff subdomain for sign-in
  if (isStaffSubdomain()) {
    return `${protocol}//${hostname}${port}/sign-in`
  }

  return `${protocol}//stuff.${hostname}${port}/sign-in`
}

/**
 * Check if a route belongs to staff domain
 * @param {string} pathname - Route pathname
 * @returns {boolean} - True if route is staff-only
 */
export function isStaffRoute(pathname) {
  const staffRoutes = [
    "/accountantportal",
    "/full-program",
    "/single-session",
    "/school",
    "/doctorportal",
    "/calendar-main",
    "/Admin-Book-Appointment",
    "/full-program-appointments",
    "/appointments",
    "/student",
    "/doctor",
    "/accountant",
    "/Payment-Transactions",
    "/checks",
    "/drive-link",
    "/sign-in",
  ]

  return staffRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

/**
 * Check if a route belongs to client domain
 * @param {string} pathname - Route pathname
 * @returns {boolean} - True if route is client-only
 */
export function isClientRoute(pathname) {
  const clientRoutes = [
    "/clientportal",
    "/Book-Appointment",
    "/profile",
    "/financial-records",
    "/student-calendar",
    "/clientportal/forgot-password",
    "/clientportal/reset-password",
  ]

  return clientRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
}

/**
 * Check if a route is accessible without authentication
 * @param {string} pathname - Route pathname
 * @returns {boolean} - True if route is public
 */
export function isPublicRoute(pathname) {
  // On staff subdomain: only /sign-in is public
  if (isStaffSubdomain()) {
    return pathname === "/sign-in" || pathname === "/error" || pathname === "/not-found"
  }

  // On main domain: /clientportal and forgot/reset password are public
  return (
    pathname === "/clientportal" ||
    pathname === "/clientportal/forgot-password" ||
    pathname === "/clientportal/reset-password" ||
    pathname === "/error" ||
    pathname === "/not-found"
  )
}

/**
 * Validate if a route is accessible on current domain
 * @param {string} pathname - Route pathname
 * @param {string} role - User role (null if unauthenticated)
 * @returns {Object} - { isValid: boolean, reason: string }
 */
export function validateRouteAccess(pathname, role) {
  const onStaffSubdomain = isStaffSubdomain()
  const staffRoles = ["admin", "HeadDoctor", "doctor", "accountant"]

  // Check if route is public
  if (isPublicRoute(pathname)) {
    return { isValid: true, reason: "public_route" }
  }

  // If not authenticated
  if (!role) {
    return { isValid: false, reason: "not_authenticated" }
  }

  // Check domain-route mismatch
  if (onStaffSubdomain && isClientRoute(pathname)) {
    return { isValid: false, reason: "client_route_on_staff_domain" }
  }

  if (!onStaffSubdomain && isStaffRoute(pathname)) {
    return { isValid: false, reason: "staff_route_on_main_domain" }
  }

  // Check role-domain mismatch
  if (onStaffSubdomain && role === "patient") {
    return { isValid: false, reason: "patient_on_staff_domain" }
  }

  if (!onStaffSubdomain && staffRoles.includes(role)) {
    return { isValid: false, reason: "staff_on_main_domain" }
  }

  const roleRoutes = getRoleRoutes(role)
  const isRouteAllowedForRole = roleRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  if (!isRouteAllowedForRole) {
    return { isValid: false, reason: "unauthorized_route_for_role" }
  }

  return { isValid: true, reason: "authorized" }
}

export function getRoleRoutes(role) {
  const roleRoutesMap = {
    admin: [
      "/",
      "/full-program",
      "/single-session",
      "/school",
      "/Admin-Book-Appointment",
      "/calendar-main",
      "/full-program-appointments",
      "/appointments/add-appointments",
      "/appointments",
      "/student/list",
      "/student/add",
      "/student/edit",
      "/student/view",
      "/doctor/list",
      "/doctor/add",
      "/doctor/edit",
      "/accountant/list",
      "/accountant/add",
      "/accountant/edit",
      "/Payment-Transactions",
      "/checks",
      "/drive-link",
      "/accountantportal/cash-payments",
      "/accountantportal/bank-transfer-payments",
      "/doctor/view", // Added doctor view route
      "/accountant/view",


    ],
    HeadDoctor: [
      "/",
      "/full-program",
      "/single-session",
      "/school",
      "/Admin-Book-Appointment",
      "/calendar-main",
      "/full-program-appointments",
      "/appointments/add-appointments",
      "/appointments",
      "/student/list",
      "/student/add",
      "/student/edit",
      "/doctor/list",
      "/doctor/add",
      "/doctor/edit",
      "/drive-link",
      "/accountantportal/cash-payments",
      "/accountantportal/bank-transfer-payments",
      "/doctor/view", // Added doctor view route
      "/accountant/view",

    ],
    doctor: [
      "/full-program",
      "/single-session",
      "/school",
      "/doctorportal",
      "/doctorportal/profile-doctor",
      "/calendar-main",
    ],
    accountant: [
      "/accountantportal",
      "/accountantportal/Payment-Transactions",
      "/accountantportal/checks",
      "/accountantportal/full-program-payment",
      "/accountantportal/profile-accountant",
      "/accountantportal/cash-payments",
      "/accountantportal/bank-transfer-payments",
    ],
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

  return roleRoutesMap[role] || []
}
